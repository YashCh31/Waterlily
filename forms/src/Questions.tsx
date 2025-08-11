import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question, Answer, SubmitAnswerRequest } from './types';
import { useAuth } from './contexts/AuthContext';

const Questions: React.FC = () => {
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      try {
        if (!user || !token) {
          setLoading(false);
          return;
        }

        const questionsResponse = await fetch('http://localhost:5001/questions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!questionsResponse.ok) {
          throw new Error(`Failed to fetch questions: ${questionsResponse.status}`);
        }

        const questionsData: Question[] = await questionsResponse.json();

        setQuestions(questionsData);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        alert(`Failed to initialize: ${errorMessage}. Please refresh the page.`);
        setLoading(false);
      }
    };

    initializeData();
  }, [user, token]);

  const handleInputChange = (questionId: number, value: string): void => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const handleBlur = (question: Question, value: string): void => {
    const isMandatory = question.field === 'Personal Information';
    let error = '';
    
    // If field is empty
    if (!value.trim()) {
      if (isMandatory) {
        error = 'This field is required';
      }
      // For optional fields, empty is okay
    } else {
      // If field has value, validate format
      switch (question.input_type) {
        case 'email':
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRe.test(value)) {
            error = 'Invalid email format';
          }
          break;
        case 'tel':
          const phoneRe = /^\d{10}$/;
          if (!phoneRe.test(value.replace(/\D/g, ''))) {
            error = 'Invalid phone number format (10 digits required)';
          }
          break;
        case 'number':
          const numberRe = /^\d+$/;
          if (!numberRe.test(value)) {
            error = 'Please enter a valid number';
          }
          break;
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [question.id]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!user?.id) {
      alert('User not authenticated. Please log in again.');
      return;
    }

    // Validate all questions - only Personal Information fields are mandatory
    const newErrors: Record<number, string> = {};
    let hasErrors = false;

    questions.forEach(question => {
      const value = answers[question.id] || '';
      const isMandatory = question.field === 'Personal Information';
      
      // If field is empty
      if (!value.trim()) {
        if (isMandatory) {
          newErrors[question.id] = 'This field is required';
          hasErrors = true;
        }
        // For optional fields, empty is okay
      } else {
        // If field has value, validate format
        let formatError = '';
        switch (question.input_type) {
          case 'email':
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(value)) {
              formatError = 'Invalid email format';
            }
            break;
          case 'tel':
            const phoneRe = /^\d{10}$/;
            if (!phoneRe.test(value.replace(/\D/g, ''))) {
              formatError = 'Invalid phone number format (10 digits required)';
            }
            break;
          case 'number':
            const numberRe = /^\d+$/;
            if (!numberRe.test(value)) {
              formatError = 'Please enter a valid number';
            }
            break;
        }
        
        if (formatError) {
          newErrors[question.id] = formatError;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      alert('Please fix the validation errors before submitting.');
      return;
    }

    // Check if all mandatory Personal Information fields are completed
    const personalInfoQuestions = questions.filter(q => q.field === 'Personal Information');
    const unansweredPersonalInfo = personalInfoQuestions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    
    if (unansweredPersonalInfo.length > 0) {
      alert('Please complete all Personal Information fields before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const answersArray: Answer[] = questions.map(question => ({
        question_id: question.id,
        answer: answers[question.id] || '' // Allow empty answers for optional fields
      }));

      const requestBody: SubmitAnswerRequest = {
        answer: answersArray
      };

      const response = await fetch('http://localhost:5001/user-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await response.json();
        navigate(`/results/${user.id}`);
      } else {
        const errorText = await response.text();
        alert(`Failed to submit answers: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to submit answers: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const validateCurrentPage = (): boolean => {
    const currentField = fieldNames[currentPageIndex];
    const currentQuestions = groupedQuestions[currentField] || [];
    
    let hasErrors = false;
    const newErrors = { ...errors };

    currentQuestions.forEach(question => {
      const value = answers[question.id] || '';
      const isMandatory = question.field === 'Personal Information';
      
      // Clear any existing errors first
      delete newErrors[question.id];
      
      // If field is empty
      if (!value.trim()) {
        if (isMandatory) {
          newErrors[question.id] = 'This field is required';
          hasErrors = true;
        }
        // For optional fields, empty is okay - no error
      } else {
        // If field has value, validate format
        let formatError = '';
        switch (question.input_type) {
          case 'email':
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(value)) {
              formatError = 'Invalid email format';
            }
            break;
          case 'tel':
            const phoneRe = /^\d{10}$/;
            if (!phoneRe.test(value.replace(/\D/g, ''))) {
              formatError = 'Invalid phone number format (10 digits required)';
            }
            break;
          case 'number':
            const numberRe = /^\d+$/;
            if (!numberRe.test(value)) {
              formatError = 'Please enter a valid number';
            }
            break;
        }
        
        if (formatError) {
          newErrors[question.id] = formatError;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault(); // Prevent form submission
    if (validateCurrentPage()) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      const currentField = fieldNames[currentPageIndex];
      if (currentField === 'Personal Information') {
        alert('Please complete all Personal Information fields before proceeding.');
      } else {
        alert('Please fix any validation errors before proceeding. Optional fields can be left empty.');
      }
    }
  };

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault(); // Prevent form submission
    setCurrentPageIndex(prev => prev - 1);
  };

  const renderInput = (question: Question): React.ReactElement => {
    const hasError = errors[question.id];
    const inputClass = `question-input ${hasError ? 'error' : ''}`;
    const textareaClass = `question-textarea ${hasError ? 'error' : ''}`;
    
    switch (question.input_type) {
      case 'textarea':
        return (
          <textarea
            id={`question-${question.id}`}
            className={textareaClass}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            onBlur={(e) => handleBlur(question, e.target.value)}
            rows={3}
            placeholder="Enter your answer..."
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={`question-${question.id}`}
            className={inputClass}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            onBlur={(e) => handleBlur(question, e.target.value)}
            placeholder="Enter a number..."
            min="0"
          />
        );
      case 'email':
        return (
          <input
            type="email"
            id={`question-${question.id}`}
            className={inputClass}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            onBlur={(e) => handleBlur(question, e.target.value)}
            placeholder="Enter your email address..."
          />
        );
      case 'tel':
        return (
          <input
            type="tel"
            id={`question-${question.id}`}
            className={inputClass}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            onBlur={(e) => handleBlur(question, e.target.value)}
            placeholder="Enter your phone number..."
          />
        );
      default:
        return (
          <input
            type="text"
            id={`question-${question.id}`}
            className={inputClass}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            onBlur={(e) => handleBlur(question, e.target.value)}
            placeholder="Enter your answer..."
          />
        );
    }
  };

  const groupedQuestions = questions.reduce((groups, question) => {
    const field = question.field;
    if (!groups[field]) {
      groups[field] = [];
    }
    groups[field].push(question);
    return groups;
  }, {} as Record<string, Question[]>);

  const fieldNames = Object.keys(groupedQuestions);
  const totalPages = fieldNames.length;
  const currentField = fieldNames[currentPageIndex] || '';
  const currentQuestions = groupedQuestions[currentField] || [];
  const isFirstPage = currentPageIndex === 0;

  if (loading) {
    return (
      <div className="loading-questions">
        <h2>Loading Questions...</h2>
        <p>Please wait while we prepare your questionnaire.</p>
      </div>
    );
  }

  return (
    <div className="questions-container">
      <div className="questions-header">
        <h1>User Questionnaire</h1>
        <p>Please fill out all the information below</p>
        <div className="progress-indicator">
          <span>Page {currentPageIndex + 1} of {totalPages}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <form className="questions-form" onSubmit={handleSubmit}>
        <fieldset className="questions-fieldset">
          <legend className="questions-legend">{currentField}</legend>
          {currentQuestions.map((question) => {
            const isMandatory = question.field === 'Personal Information';
            return (
              <div key={question.id} className="question-item">
                <label htmlFor={`question-${question.id}`} className="question-label">
                  {question.title}
                  {isMandatory && <span className="required-asterisk"> *</span>}
                </label>
                {question.description && (
                  <p className="question-description">{question.description}</p>
                )}
                {renderInput(question)}
                {errors[question.id] && (
                  <div className="question-error">{errors[question.id]}</div>
                )}
              </div>
            );
          })}
        </fieldset>

        <div className="navigation-section">
          <div className="nav-buttons">
            <button 
              type="button" 
              onClick={handlePrevious}
              disabled={isFirstPage}
              className="nav-button prev-button"
            >
              Previous
            </button>
            
            {currentPageIndex < totalPages - 1 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="nav-button next-button"
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={submitting} 
                className="submit-button"
              >
                {submitting ? 'Submitting...' : 'Submit All Answers'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Questions;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question, User, Answer, SubmitAnswerRequest, SubmitAnswerResponse } from './src/types';
//import { validateField } from './utils/validation';

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      try {
        const userResponse = await fetch('http://localhost:5001/users', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to create user: ${userResponse.status}`);
        }

        const userData: User = await userResponse.json();
        const questionsResponse = await fetch('http://localhost:5001/questions');

        if (!questionsResponse.ok) {
          throw new Error(`Failed to fetch questions: ${questionsResponse.status}`);
        }

        const questionsData: Question[] = await questionsResponse.json();

        setUserId(userData.id);
        setQuestions(questionsData);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        alert(`Failed to initialize: ${errorMessage}. Please refresh the page.`);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

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
    const error = validateField(question.input_type, value);
    setErrors(prev => ({
      ...prev,
      [question.id]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!userId) {
      alert('User ID not found. Please refresh the page.');
      return;
    }

    const newErrors: Record<number, string> = {};
    let hasErrors = false;

    questions.forEach(question => {
      const value = answers[question.id] || '';
      const error = validateField(question.input_type, value);
      if (error) {
        newErrors[question.id] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      alert('Please fix the validation errors before submitting.');
      return;
    }

    const unansweredQuestions = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const answersArray: Answer[] = questions.map(question => ({
        question_id: question.id,
        answer: answers[question.id]
      }));

      const requestBody: SubmitAnswersRequest = {
        user_id: userId,
        answers: answersArray
      };

      const response = await fetch('http://localhost:5001/user-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result: SubmitAnswersResponse[] = await response.json();
        navigate(`/results/${userId}`);
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

  const renderInput = (question: Question): React.ReactElement => {
    switch (question.input_type) {
      case 'textarea':
        return (
          <textarea
            id={`question-${question.id}`}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            rows={3}
            placeholder="Enter your answer..."
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={`question-${question.id}`}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Enter a number..."
            min="0"
          />
        );
      case 'email':
        return (
          <input
            type="email"
            id={`question-${question.id}`}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Enter your email address..."
          />
        );
      case 'tel':
        return (
          <input
            type="tel"
            id={`question-${question.id}`}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Enter your phone number..."
          />
        );
      default:
        return (
          <input
            type="text"
            id={`question-${question.id}`}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
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

  if (loading) {
    return (
      <div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>User Questionnaire</h1>
      <p>Please fill out all the information below</p>

      <form onSubmit={handleSubmit}>
        {Object.entries(groupedQuestions).map(([field, fieldQuestions]) => (
          <fieldset key={field}>
            <legend>{field}</legend>
            {fieldQuestions.map((question) => (
              <div key={question.id}>
                <label htmlFor={`question-${question.id}`}>{question.title}</label>
                {question.description && <p>{question.description}</p>}
                {renderInput(question)}
                {errors[question.id] && <p>{errors[question.id]}</p>}
              </div>
            ))}
          </fieldset>
        ))}

        <div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Questions;

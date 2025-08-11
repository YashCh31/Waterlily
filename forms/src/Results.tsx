import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserAnswer } from './types';
import { useAuth } from './contexts/AuthContext';

const Results: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!userId) {
                setError('No user ID provided');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5001/user-answers/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch results: ${response.status}`);
                }
                const data: UserAnswer[] = await response.json();
                setUserAnswers(data);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error("Error fetching results:", err);
                setError(`Error fetching results: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [userId, token]);

    const handleNewSubmission = () => {
        navigate('/');
    };

    // Group answers by field for better organization
    const groupedAnswers = userAnswers.reduce((groups, answer) => {
        const field = answer.field;
        if (!groups[field]) {
            groups[field] = [];
        }
        groups[field].push(answer);
        return groups;
    }, {} as Record<string, UserAnswer[]>);

    if (loading) {
        return (
            <div className="loading-container">
                <h2>Loading Results...</h2>
                <p>Please wait while we fetch your responses.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p className="error-message">{error}</p>
                <button onClick={handleNewSubmission} className="button-primary">
                    Try Again
                </button>
            </div>
        );
    }

    if (userAnswers.length === 0) {
        return (
            <div className="no-results-container">
                <h2>No Results Found</h2>
                <p>No responses found for this user.</p>
                <button onClick={handleNewSubmission} className="button-primary">
                    Start New Survey
                </button>
            </div>
        );
    }

    return (
        <div className="results-container">
            <div className="results-header">
                <h1>Survey Results</h1>
                <p>Thank you for completing the questionnaire! Here are your responses:</p>
                <p className="results-meta">
                    User ID: {userId} | Submitted: {userAnswers[0]?.created_at ? new Date(userAnswers[0].created_at).toLocaleDateString() : 'N/A'}
                </p>
            </div>

            {Object.entries(groupedAnswers).map(([field, answers]) => (
                <div key={field} className="field-section">
                    <h2 className="field-title">{field}</h2>
                    
                    {answers.map((answer) => (
                        <div key={answer.id} className="answer-item">
                            <div className="question-title">
                                {answer.title}
                            </div>
                            
                            {answer.description && (
                                <div className="question-description">
                                    {answer.description}
                                </div>
                            )}
                            
                            <div className="answer-text">
                                <strong>Your Answer:</strong> {answer.answer || 'No answer provided'}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="results-actions">
                <button 
                    onClick={handleNewSubmission}
                    className="button-success"
                >
                    Submit Another Response
                </button>
            </div>
        </div>
    );
};

export default Results;
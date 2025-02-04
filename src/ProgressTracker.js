import React from 'react';

export function ProgressTracker({ progress }) {
  return (
    <div className="progress-tracker">
      {progress.map((step, index) => {
        const isStepVisible =
          index === 0 ||
          progress[index - 1].status === 'success' ||
          progress[index - 1].status === 'error';

        if (!isStepVisible) return null;

        return (
          <div key={step.id} className={`step ${step.status}`}>
            <div>
              <div className="step-header">
                <span className="step-text">{step.text}</span>
                {step.status === 'pending' ? (
                  <span className="loading-spinner">Loading...</span>
                ) : null}
                {step.status === 'success' ? <span className="status-success">Success</span> : null}
                {step.status === 'error' ? <span className="status-error">Error</span> : null}
              </div>

              {step.status === 'error' && step.errorMessage ? (
                <div className="error-message">
                  <p className="has-text-danger">Error: {step.errorMessage}</p>
                </div>
              ) : null}

              {step.requestUrl ? (
                <div className="request-url">
                  <p>Request: {step.requestUrl}</p>
                </div>
              ) : null}

              {step.payload ? (
                <div className="payload">
                  <p>Payload: {step.payload}</p>
                </div>
              ) : null}

              {step.kuboCli ? (
                <div className="cli-command">
                  <p>Kubo CLI: {step.kuboCli}</p>
                </div>
              ) : null}
            </div>
            {step.response ? (
              <div>
                <p>Response:</p>
                <div className="response">
                  <pre>
                    {typeof step.response === 'object'
                      ? JSON.stringify(step.response, null, 2)
                      : step.response}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

import PropTypes from 'prop-types';
import React from 'react';
import { cn } from '../../utils/cn';

/**
 * A reusable component for displaying error messages
 * 
 * @param {Object} props
 * @param {string|null} props.error - The error message to display
 * @param {string} props.className - Additional CSS classes to apply
 * @returns {JSX.Element|null} - Returns null if no error is present
 */
const ErrorMessage = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div 
      className={cn(
        "bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded-md relative mb-4",
        className
      )} 
      role="alert"
    >
      <span className="block sm:inline">{error}</span>
    </div>
  );
};

ErrorMessage.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string
};

export default ErrorMessage; 
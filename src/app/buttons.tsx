import React from 'react';

interface ButtonProps {
  label: string;                 // button text
  onClick: () => void;            // function to execute on click
  variant?: 'primary' | 'danger' | 'secondary'; // style variant
  disabled?: boolean;             // disabled state (for out of stock)
}


  
  

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary', disabled }) => {
  const buttonClass = variant === 'danger'
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-blue-500 hover:bg-blue-600 text-white';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${buttonClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
};

export default Button;

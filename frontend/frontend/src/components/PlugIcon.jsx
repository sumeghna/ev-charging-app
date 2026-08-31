import React from 'react';

const PlugIcon = ({ type, size = 24 }) => {
  const getIcon = () => {
    switch(type) {
      case 'Type1':
        return '🔌';
      case 'Type2':
        return '⚡';
      case 'CCS1':
        return '🚗';
      case 'CCS2':
        return '🚙';
      case 'CHAdeMO':
        return '🔋';
      case 'Tesla':
        return '🔱';
      default:
        return '⚡';
    }
  };

  return (
    <span style={{ fontSize: size }} className="inline-block">
      {getIcon()}
    </span>
  );
};

export default PlugIcon;
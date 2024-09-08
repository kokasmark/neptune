import React, { useState, useEffect } from 'react';
import Switch from 'react-ios-switch';

const ToggleSwitch = ({ name, defaultValue, onChange }) => {
  // Initialize state
  const [checked, setChecked] = useState(defaultValue);

  // Use useEffect to initialize state from localStorage
  useEffect(() => {
    const storedValue = localStorage.getItem(`neptune-setting-${name}`);
    if (storedValue !== null) {
      setChecked(storedValue === "true");
    }
  }, [name]); // Run the effect only when `name` changes

  // Toggle function
  const handleToggle = () => {
    setChecked(prevChecked => {
      const newChecked = !prevChecked;
      localStorage.setItem(`neptune-setting-${name}`, newChecked);

      // Call the onChange callback with the new state
      if (onChange) {
        onChange(newChecked);
      }

      return newChecked;
    });
  };

  return (
    <Switch 
      checked={checked}
      onChange={handleToggle} // Toggle the switch when changed
      onColor={"#23adec"}
    />
  );
};

export default ToggleSwitch;

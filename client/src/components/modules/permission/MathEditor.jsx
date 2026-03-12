




'use client';
import React, { useEffect, useRef } from 'react';

export default function MathEditor({ value, onChange, readOnly = false }) {
  const mathEditorRef = useRef(null);


  useEffect(() => {
    const scriptId = 'mathlive-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/mathlive?module';
    script.type = 'module';
    script.async = true;
    script.onload = () => console.log('✅ MathLive loaded');
    document.head.appendChild(script);
  }, []);

  // 2️⃣ Wait until <math-field> is defined
  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.MathfieldElement && mathEditorRef.current) {
        clearInterval(checkReady);

        const mathField = mathEditorRef.current;

        // Proper listener for MathLive
        const handleChange = (evt) => {
          const newValue = evt.target.getValue
            ? evt.target.getValue()
            : evt.target.value;
          onChange(newValue);
        };

        mathField.addEventListener('input', handleChange);
        mathField.addEventListener('change', handleChange);

        return () => {
          mathField.removeEventListener('input', handleChange);
          mathField.removeEventListener('change', handleChange);
        };
      }
    }, 200);

    return () => clearInterval(checkReady);
  }, [onChange]);

  // 3️⃣ External value update
  useEffect(() => {
    if (mathEditorRef.current && mathEditorRef.current.getValue) {
      const currentVal = mathEditorRef.current.getValue();
      if (currentVal !== value) {
        mathEditorRef.current.setValue(value);
      }
    }
  }, [value]);

  return (
    <>
      <math-field ref={mathEditorRef} readOnly={readOnly}>
        {value}
      </math-field>

      <style jsx global>{`
        math-field {
          display: block;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 1.25rem;
          background: #ffffff;
          width: 100%;
          box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
        }
        math-field:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px #bfdbfe;
          outline: none;
        }
      `}</style>
    </>
  );
}

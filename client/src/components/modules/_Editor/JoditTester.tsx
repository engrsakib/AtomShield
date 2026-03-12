import React, { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';

const EditorPage = () => {
  const editor = useRef(null);
  const [content, setContent] = useState('');

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'writing...',
      height: 400,
    }),
    []
  );

  const handleSubmit = () => {
    console.log('Content:', content);
    alert('save!');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Jodit Editor</h1>

      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => setContent(newContent)}
        onChange={() => {}}
      />

      <button
        onClick={handleSubmit}
        style={{
          marginTop: '16px',
          padding: '10px 24px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Save
      </button>

      <div style={{ marginTop: '24px' }}>
        <h3>Preview:</h3>
        <div
          style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
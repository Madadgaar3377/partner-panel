import React, { useRef, useCallback, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Enter description..." }) => {
    const editorRef = useRef(null);
    const isUpdatingRef = useRef(false);

    useEffect(() => {
        if (editorRef.current && !isUpdatingRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    useEffect(() => {
        // Set default paragraph separator to br for better line break handling
        try {
            document.execCommand('defaultParagraphSeparator', false, 'br');
        } catch (e) {
            console.log('Could not set default paragraph separator:', e);
        }
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current && onChange) {
            isUpdatingRef.current = true;
            onChange(editorRef.current.innerHTML);
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
    }, [onChange]);

    const handleKeyDown = useCallback((e) => {
        // Handle Enter key to ensure proper line breaks
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const currentNode = range.startContainer;
            
            // If we're not in a specific formatting block (like h1, h2, list, etc.)
            if (currentNode.nodeType === Node.TEXT_NODE || currentNode.nodeName === 'DIV') {
                e.preventDefault();
                
                // Insert line break
                const br = document.createElement('br');
                range.deleteContents();
                range.insertNode(br);
                
                // Check if we need a second br (when at end of line)
                const nextNode = br.nextSibling;
                if (!nextNode || nextNode.nodeName === 'BR') {
                    const br2 = document.createElement('br');
                    br.parentNode.insertBefore(br2, br.nextSibling);
                    range.setStartAfter(br);
                    range.setEndAfter(br);
                } else {
                    range.setStartAfter(br);
                    range.setEndAfter(br);
                }
                
                selection.removeAllRanges();
                selection.addRange(range);
                
                handleInput();
            }
            // For Shift+Enter, allow default behavior (single line break)
        }
    }, [handleInput]);

    const execCommand = useCallback((command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    }, [handleInput]);

    const insertLink = useCallback(() => {
        const url = prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    }, [execCommand]);

    const insertImage = useCallback(() => {
        const url = prompt('Enter image URL:');
        if (url) {
            execCommand('insertImage', url);
        }
    }, [execCommand]);

    const changeColor = useCallback((type) => {
        const color = prompt(`Enter ${type} color (e.g., #ff0000 or red):`);
        if (color) {
            execCommand(type === 'text' ? 'foreColor' : 'backColor', color);
        }
    }, [execCommand]);

    return (
        <div className="rich-text-editor-wrapper">
            <style>{`
                .rich-text-editor-wrapper {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.2s;
                    background: white;
                }
                
                .rich-text-editor-wrapper:focus-within {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }
                
                .rte-toolbar {
                    background: #f9fafb;
                    border-bottom: 2px solid #e5e7eb;
                    padding: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                
                .rte-btn {
                    padding: 6px 10px;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .rte-btn:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }
                
                .rte-btn:active {
                    transform: scale(0.95);
                }
                
                .rte-btn-group {
                    display: flex;
                    gap: 4px;
                    padding: 2px;
                    background: white;
                    border-radius: 8px;
                }
                
                .rte-separator {
                    width: 1px;
                    background: #d1d5db;
                    margin: 0 4px;
                }
                
                .rte-editor {
                    min-height: 200px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 16px;
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #374151;
                    outline: none;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                
                .rte-editor p {
                    margin: 8px 0;
                }
                
                .rte-editor br {
                    display: block;
                    margin: 4px 0;
                    content: "";
                }
                
                .rte-editor:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                }
                
                .rte-editor h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
                .rte-editor h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
                .rte-editor h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
                .rte-editor h4 { font-size: 1em; font-weight: bold; margin: 1em 0; }
                .rte-editor h5 { font-size: 0.83em; font-weight: bold; margin: 1.17em 0; }
                .rte-editor h6 { font-size: 0.67em; font-weight: bold; margin: 1.5em 0; }
                
                .rte-editor ul, .rte-editor ol { padding-left: 24px; margin: 12px 0; }
                .rte-editor li { margin: 4px 0; }
                .rte-editor blockquote { border-left: 4px solid #ef4444; padding-left: 16px; margin: 16px 0; color: #6b7280; }
                .rte-editor a { color: #ef4444; text-decoration: underline; }
                .rte-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }
                
                .rte-editor::-webkit-scrollbar { width: 8px; }
                .rte-editor::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 8px; }
                .rte-editor::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 8px; }
                .rte-editor::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                
                @media (max-width: 640px) {
                    .rte-toolbar { padding: 6px; }
                    .rte-btn { padding: 5px 8px; font-size: 12px; }
                    .rte-editor { padding: 12px; font-size: 13px; }
                }
            `}</style>
            
            {/* Toolbar */}
            <div className="rte-toolbar">
                {/* Text Formatting */}
                <div className="rte-btn-group">
                    <button type="button" className="rte-btn" onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
                        <strong>B</strong>
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
                        <em>I</em>
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
                        <u>U</u>
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('strikeThrough')} title="Strikethrough">
                        <s>S</s>
                    </button>
                </div>
                
                <div className="rte-separator"></div>
                
                {/* Headings */}
                <div className="rte-btn-group">
                    <button type="button" className="rte-btn" onClick={() => execCommand('formatBlock', 'h1')} title="Heading 1">
                        H1
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('formatBlock', 'h2')} title="Heading 2">
                        H2
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('formatBlock', 'h3')} title="Heading 3">
                        H3
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('formatBlock', 'p')} title="Paragraph">
                        P
                    </button>
                </div>
                
                <div className="rte-separator"></div>
                
                {/* Lists */}
                <div className="rte-btn-group">
                    <button type="button" className="rte-btn" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                        • List
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                        1. List
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('insertLineBreak')} title="Line Break (Shift+Enter)">
                        ↵ Break
                    </button>
                </div>
                
                <div className="rte-separator"></div>
                
                {/* Alignment */}
                <div className="rte-btn-group">
                    <button type="button" className="rte-btn" onClick={() => execCommand('justifyLeft')} title="Align Left">
                        ⬅
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('justifyCenter')} title="Align Center">
                        ⬌
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('justifyRight')} title="Align Right">
                        ➡
                    </button>
                </div>
                
                <div className="rte-separator"></div>
                
                {/* Insert */}
                <div className="rte-btn-group">
                    <button type="button" className="rte-btn" onClick={insertLink} title="Insert Link">
                        🔗 Link
                    </button>
                    <button type="button" className="rte-btn" onClick={insertImage} title="Insert Image">
                        🖼 Image
                    </button>
                </div>
                
                <div className="rte-separator"></div>
                
                {/* Colors */}
                <div className="rte-btn-group">
                    <button type="button" className="rte-btn" onClick={() => changeColor('text')} title="Text Color">
                        🎨 Color
                    </button>
                    <button type="button" className="rte-btn" onClick={() => changeColor('bg')} title="Background Color">
                        🎨 BG
                    </button>
                </div>
                
                <div className="rte-separator"></div>
                
                {/* Special */}
                <div className="rte-btn-group">
                    <button type="button" className="rte-btn" onClick={() => execCommand('formatBlock', 'blockquote')} title="Quote">
                        " Quote
                    </button>
                    <button type="button" className="rte-btn" onClick={() => execCommand('removeFormat')} title="Clear Formatting">
                        🧹 Clear
                    </button>
                </div>
            </div>
            
            {/* Editor */}
            <div
                ref={editorRef}
                className="rte-editor"
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />
        </div>
    );
};

export default RichTextEditor;

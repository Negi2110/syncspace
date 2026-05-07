import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Toolbar from './Toolbar';

export default function Editor({ content, onChange, editable = true }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your document...'
            }),
        ],
        content: content ? JSON.parse(content) : '',
        editable,
        onUpdate: ({ editor }) => {
            const json = JSON.stringify(editor.getJSON());
            onChange(json);
        },
    });

    // Update content when it changes externally (real-time sync)
    useEffect(() => {
        if (!editor || !content) return;

        const currentContent = JSON.stringify(editor.getJSON());
        if (currentContent !== content) {
            editor.commands.setContent(JSON.parse(content), false);
        }
    }, [content]);

    // Update editable state
    useEffect(() => {
        if (!editor) return;
        editor.setEditable(editable);
    }, [editor, editable]);

    return (
        <div className="flex flex-col h-full">
            {editable && <Toolbar editor={editor} />}
            <EditorContent
                editor={editor}
                className="tiptap-editor flex-1 overflow-y-auto"
            />
        </div>
    );
}
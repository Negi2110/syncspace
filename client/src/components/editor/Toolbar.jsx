export default function Toolbar({ editor }) {
    if (!editor) return null;

    const tools = [
        {
            label: 'B',
            title: 'Bold',
            action: () => editor.chain().focus().toggleBold().run(),
            active: editor.isActive('bold'),
            style: 'font-bold'
        },
        {
            label: 'I',
            title: 'Italic',
            action: () => editor.chain().focus().toggleItalic().run(),
            active: editor.isActive('italic'),
            style: 'italic'
        },
        {
            label: 'H1',
            title: 'Heading 1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            active: editor.isActive('heading', { level: 1 }),
        },
        {
            label: 'H2',
            title: 'Heading 2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            active: editor.isActive('heading', { level: 2 }),
        },
        {
            label: 'H3',
            title: 'Heading 3',
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            active: editor.isActive('heading', { level: 3 }),
        },
        {
            label: '• List',
            title: 'Bullet List',
            action: () => editor.chain().focus().toggleBulletList().run(),
            active: editor.isActive('bulletList'),
        },
        {
            label: '1. List',
            title: 'Ordered List',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            active: editor.isActive('orderedList'),
        },
        {
            label: '</>',
            title: 'Code Block',
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            active: editor.isActive('codeBlock'),
            style: 'font-mono'
        },
        {
            label: '" "',
            title: 'Blockquote',
            action: () => editor.chain().focus().toggleBlockquote().run(),
            active: editor.isActive('blockquote'),
        },
    ];

    return (
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-800 border-b border-slate-700 flex-wrap">
            {tools.map((tool, i) => (
                <button
                    key={i}
                    title={tool.title}
                    onClick={tool.action}
                    className={`
                        px-2.5 py-1 rounded text-xs font-medium
                        transition-colors duration-150
                        ${tool.style || ''}
                        ${tool.active
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        }
                    `}
                >
                    {tool.label}
                </button>
            ))}

            <div className="w-px h-4 bg-slate-700 mx-1" />

            {/* Undo/Redo */}
            <button
                title="Undo"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="px-2.5 py-1 rounded text-xs text-slate-400
                           hover:text-slate-200 hover:bg-slate-700
                           disabled:opacity-30 disabled:cursor-not-allowed"
            >
                ↩
            </button>
            <button
                title="Redo"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="px-2.5 py-1 rounded text-xs text-slate-400
                           hover:text-slate-200 hover:bg-slate-700
                           disabled:opacity-30 disabled:cursor-not-allowed"
            >
                ↪
            </button>
        </div>
    );
}
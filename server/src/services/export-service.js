const puppeteer = require('puppeteer-core');
const { DocumentRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

const documentRepository = new DocumentRepository();

// Convert Tiptap JSON content to Markdown string
function tiptapToMarkdown(content) {
    if (!content) return '';

    let parsed;
    try {
        parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
        return content; // return as is if not JSON
    }

    let markdown = '';

    function processNode(node) {
        if (!node) return '';

        switch (node.type) {
            case 'doc':
                return (node.content || []).map(processNode).join('\n');

            case 'heading':
                const level = node.attrs?.level || 1;
                const headingText = (node.content || []).map(processNode).join('');
                return '#'.repeat(level) + ' ' + headingText + '\n';

            case 'paragraph':
                const paraText = (node.content || []).map(processNode).join('');
                return paraText + '\n';

            case 'text':
                let text = node.text || '';
                if (node.marks) {
                    node.marks.forEach(mark => {
                        if (mark.type === 'bold') text = `**${text}**`;
                        if (mark.type === 'italic') text = `*${text}*`;
                        if (mark.type === 'code') text = `\`${text}\``;
                    });
                }
                return text;

            case 'codeBlock':
                const lang = node.attrs?.language || '';
                const code = (node.content || []).map(processNode).join('');
                return `\`\`\`${lang}\n${code}\n\`\`\`\n`;

            case 'bulletList':
                return (node.content || []).map(item => {
                    const itemText = (item.content || []).map(processNode).join('');
                    return `- ${itemText}`;
                }).join('\n') + '\n';

            case 'orderedList':
                return (node.content || []).map((item, index) => {
                    const itemText = (item.content || []).map(processNode).join('');
                    return `${index + 1}. ${itemText}`;
                }).join('\n') + '\n';

            case 'blockquote':
                const quoteText = (node.content || []).map(processNode).join('');
                return `> ${quoteText}\n`;

            case 'hardBreak':
                return '\n';

            default:
                return (node.content || []).map(processNode).join('');
        }
    }

    return processNode(parsed);
}

// Export document as Markdown
async function exportMarkdown(documentId) {
    try {
        const document = await documentRepository.get(documentId);

        const markdown = `# ${document.title}\n\n${tiptapToMarkdown(document.content)}`;

        return {
            content: markdown,
            filename: `${document.title.replace(/\s+/g, '-').toLowerCase()}.md`,
            contentType: 'text/markdown'
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot export document as Markdown',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

// Export document as PDF
async function exportPDF(documentId) {
    try {
        const document = await documentRepository.get(documentId);
        const markdown = tiptapToMarkdown(document.content);

        // Convert markdown to HTML for rendering
        const { marked } = require('marked');
        const htmlContent = marked(markdown);

        // Full HTML page with styling
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #1a1a1a;
            line-height: 1.6;
        }
        h1 { font-size: 2em; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h2 { font-size: 1.5em; margin-top: 2em; }
        h3 { font-size: 1.2em; }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }
        pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
        }
        pre code {
            background: none;
            color: inherit;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #6366f1;
            margin: 0;
            padding-left: 20px;
            color: #6b7280;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
        }
        th { background: #f9fafb; }
        .title {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .meta {
            color: #6b7280;
            font-size: 0.9em;
            margin-bottom: 40px;
        }
    </style>
</head>
<body>
    <div class="title">${document.title}</div>
    <div class="meta">Exported from SyncSpace • ${new Date().toLocaleDateString()}</div>
    ${htmlContent}
</body>
</html>`;

        // Launch headless Chrome and generate PDF
        const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            },
            printBackground: true
        });

        await browser.close();

        return {
            content: pdf,
            filename: `${document.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
            contentType: 'application/pdf'
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            'Cannot export document as PDF',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    exportMarkdown,
    exportPDF,
    tiptapToMarkdown
}
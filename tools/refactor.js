const fs = require('fs');
const path = require('path');

const files = ['svg2png.html', 'tupianpinjie.html', 'wenbenqingli.html'];

files.forEach(file => {
    let content = fs.readFileSync(path.join(__dirname, file), 'utf-8');

    // Remove old tailwind config if it exists
    content = content.replace(/<script>\s*tailwind\.config = {[\s\S]*?}<\/script>/, '');

    // Add new tailwind config and style.css
    const headInjection = `    <link rel="stylesheet" href="../style.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        theme: 'var(--accent-color)',
                        bg: 'var(--bg-color)',
                        redAlert: '#CB3A56',
                        redDark: '#82111f',
                        blueAlt: 'var(--header-text-color)',
                        whiteAlt: 'var(--border-color)',
                        blackAlt: 'var(--text-color)'
                    }
                }
            }
        }
    </script>`;
    
    // Replace <script src="https://cdn.tailwindcss.com"></script> with itself + our injection
    content = content.replace('<script src="https://cdn.tailwindcss.com"></script>', '<script src="https://cdn.tailwindcss.com"></script>\n' + headInjection);

    // Remove old scrollbar styles
    content = content.replace(/::-webkit-scrollbar[\s\S]*?}/g, '');
    content = content.replace(/::-webkit-scrollbar-track[\s\S]*?}/g, '');
    content = content.replace(/::-webkit-scrollbar-thumb[\s\S]*?}/g, '');
    content = content.replace(/::-webkit-scrollbar-thumb:hover[\s\S]*?}/g, '');

    // For tools that use arbitrary values like [#815c94]
    content = content.replace(/\[#815c94\]/gi, 'theme');
    content = content.replace(/\[#8076a3\]/gi, 'bg');
    content = content.replace(/\[#CB3A56\]/gi, 'redAlert');
    content = content.replace(/\[#82111f\]/gi, 'redDark');
    content = content.replace(/\[#525288\]/gi, 'blueAlt');
    content = content.replace(/\[#fbecde\]/gi, 'whiteAlt');
    content = content.replace(/\[#4c1f24\]/gi, 'blackAlt');

    // Add Toolbar
    const toolbarHtml = `
    <!-- Toolbar for Theme Controls -->
    <div class="toolbar" style="padding: 10px 20px; z-index: 50;">
        <h1 style="font-size: 1.2rem; cursor: pointer;" onclick="window.location.href='../index.html'">嘂 - 首页</h1>
        <div class="controls">
            <select id="toneSelect">
                <option value="neutral">中性 (Neutral)</option>
                <option value="cool">冷调 (Cool)</option>
                <option value="warm">暖调 (Warm)</option>
            </select>
            <select id="modeSelect">
                <option value="light">日间 (Light)</option>
                <option value="dark">夜间 (Dark)</option>
            </select>
        </div>
    </div>`;

    // Inject toolbar right after <body ...>
    content = content.replace(/(<body[^>]*>)/i, '$1' + toolbarHtml);
    
    // Remove bg-bg or bg-[#...] from body so it takes global background
    content = content.replace(/(<body[^>]*)bg-bg/i, '$1');
    content = content.replace(/(<body[^>]*)bg-theme/i, '$1');
    // Also add .text-blackAlt just in case it doesn't have it
    if (!content.match(/<body[^>]*text-blackAlt/)) {
        content = content.replace(/(<body[^>]*class=")/i, '$1text-blackAlt ');
    }

    // Add script.js at the end of body
    if (!content.includes('<script src="../script.js"></script>')) {
        content = content.replace(/<\/body>/i, '    <script src="../script.js"></script>\n</body>');
    }

    // Make some adjustments to inner containers to behave like glass panels
    // Add custom style for bg-whiteAlt to make it glassy
    content = content.replace('</head>', `
    <style>
        .bg-whiteAlt { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border: 1px solid var(--border-color); }
        .text-blackAlt { color: var(--text-color); }
    </style>
</head>`);

    fs.writeFileSync(path.join(__dirname, file), content, 'utf-8');
});

console.log("Refactoring complete.");

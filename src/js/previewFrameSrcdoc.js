export const PREVIEW_FRAME_SRCDOC = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="css/common.css">
    <link rel="stylesheet" type="text/css" href="css/newtab.css">
    <link id="head-design-theme" rel="stylesheet" type="text/css" href="">
    <link id="head-design-color" rel="stylesheet" type="text/css" href="">
    <link id="head-design-style" rel="stylesheet" type="text/css" href="">
    <style>
        html, body {
            height: 100%;
            margin: 0;
            overflow: hidden;
        }
        #bookmark-search-group,
        #float-menu-theme,
        #float-menu-visibility {
            display: none !important;
        }
        #system-link-area {
            display: block !important;
            width: 2.9rem !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            opacity: 1 !important;
            overflow: visible;
        }
        #system-link-area .menu {
            width: 2.1rem;
            height: 2.1rem;
            margin: .35rem .35rem;
            padding: 0;
            border-radius: .55rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .66rem;
            line-height: 1;
            text-indent: -9999px;
            white-space: nowrap;
            overflow: hidden;
        }
        #system-link-area .menu-icon {
            display: block !important;
            width: 1.1rem;
            height: 1.1rem;
            padding: 0;
        }
        #body-main {
            margin: 0 0 0 3.2rem !important;
            padding: .55rem .75rem .45rem .55rem !important;
            opacity: 1 !important;
        }
        #web-search-area {
            display: flex !important;
            position: sticky;
            top: .45rem;
            z-index: 5;
            align-items: center;
            justify-content: flex-start;
            gap: .45rem;
            padding: 0;
            margin: 0 0 .55rem 0;
        }
        #web-search-input {
            width: min(19rem, calc(100vw - 9rem));
            height: 2rem;
            padding: .48rem .8rem;
            font-size: .8rem;
        }
        #web-search-submit {
            margin: 0;
            height: 2rem;
            padding: .48rem .8rem;
            font-size: .8rem;
        }
        .content-module {
            margin: 0 !important;
            width: 100%;
            min-width: 0;
            max-width: none;
        }
        #body-main .preview-bookmarks-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: .65rem;
            align-items: start;
        }
        .preview-bookmarks-grid .content-header,
        .preview-bookmarks-grid .bookmark-count,
        .preview-bookmarks-grid .content-module ul li a {
            padding-top: .28rem;
            padding-bottom: .28rem;
        }
        .preview-card-title {
            font-size: .98rem;
            font-weight: 700;
        }
        .preview-bookmarks-grid .content-module {
            float: none !important;
            width: 100%;
        }
    </style>
</head>
<body class="bg-styledefault">
    <div id="system-link-area">
        <div class="menu"><img class="menu-icon" src="img/icon-menu.svg">System Pages</div>
        <div class="menu"><img class="menu-icon" src="img/icon-search.svg">Search</div>
    </div>
    <div id="body-main">
        <div id="web-search-area">
            <input id="web-search-input" type="text" placeholder="Search" readonly>
            <input id="web-search-submit" type="submit" value="Search">
        </div>
        <div class="preview-bookmarks-grid">
            <div class="content-module">
                <div class="content-header preview-card-title">Bookmarks</div>
                <ul>
                    <li><a href="javascript:void(0)"><img class="favicon" src="./img/icon_032.png">Bookmark-1</a></li>
                    <li><a href="javascript:void(0)"><img class="favicon" src="./img/icon_032.png">Bookmark-2</a></li>
                    <li><a href="javascript:void(0)"><img class="favicon" src="./img/icon_032.png">Bookmark-3</a></li>
                </ul>
                <span class="bookmark-count">3 bookmarks</span>
            </div>
            <div class="content-module">
                <div class="content-header preview-card-title">Services</div>
                <ul>
                    <li><a href="javascript:void(0)"><img class="favicon" src="./img/icon_032.png" style="border-radius: 50%;">Bookmark-4</a></li>
                    <li><a href="javascript:void(0)"><img class="favicon" src="./img/icon_032.png" style="border-radius: 50%;">Bookmark-5</a></li>
                    <li><a href="javascript:void(0)"><img class="favicon" src="./img/icon_032.png" style="border-radius: 50%;">Bookmark-6</a></li>
                    <li><a href="javascript:void(0)"><img class="favicon" src="./img/icon_032.png" style="border-radius: 50%;">Bookmark-7</a></li>
                </ul>
                <span class="bookmark-count">4 bookmarks</span>
            </div>
        </div>
    </div>
</body>
</html>`

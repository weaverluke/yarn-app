window.yarnHighlight = (function () {
    var lastHighlighted = {
        node: undefined,
        content: undefined
    };

    function highlight(word) {
        var n;
        var walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
        
        unhighlight();

        var rx = new RegExp('\\b' + word + '\\b');

        while (n = walker.nextNode()) {
            if (rx.test(n.nodeValue)) {
                lastHighlighted.node = n.parentNode;
                lastHighlighted.content = n.parentNode.innerHTML;
                lastHighlighted.node.innerHTML = lastHighlighted.content.replace(rx, 
                    '<mark style="background-color:rgb(0, 255, 100);font-style:inherit;font-weight:inherit;">'+word+'</mark>'
                );
                lastHighlighted.node.scrollIntoViewIfNeeded();
                return true;
            }
        }
        return false;
    }

    function unhighlight() {
        if (lastHighlighted.node) {
            lastHighlighted.node.innerHTML = lastHighlighted.content;
            lastHighlighted.node = undefined;
            lastHighlighted.content = undefined;
        }
    }

    return {
        highlight: highlight
    };
}());


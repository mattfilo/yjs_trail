export default function Cursor({coordinates}) {
    return (
        <img style={{position: 'absolute', 
                     zIndex: 1, 
                     left: `${coordinates.x}px`, 
                     width: 17 + 'px', 
                     top: (coordinates.y) + 'px'}}
                     src="https://www.freeiconspng.com/thumbs/cursor-png/white-mouse-cursor-arrow-by-qubodup-11.png" 
                     alt="other client cursor" />
    );
}
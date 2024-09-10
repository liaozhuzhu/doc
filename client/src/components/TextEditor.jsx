import {useCallback, useEffect, useState} from 'react'
import Quill from 'quill'
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import {useParams} from 'react-router-dom'

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]

export default function TextEditor() {

    const id = useParams();
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();

    useEffect(() => {
        if (quill == null || socket == null) return;
        socket.once('load-document', document => {
            quill.setContents(document);
            quill.enable();
        })
        socket.emit('get-id', id);
    }, [socket, quill, id])

    useEffect(() => {
        if (quill == null || socket == null) return;
        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents());
        }, 500)
        return () => {
            clearInterval(interval);
        }
    }, [socket, quill])

    useEffect(() => {
        const socketConnection = io("http://localhost:3001");
        setSocket(socketConnection)
        return () => {
            socketConnection.disconnect();
        }
    }, [])

    useEffect(() => {
        if (quill == null || socket == null) return;
        const handler = (delta) => {
            quill.updateContents(delta)
        }
        socket.on('receive-changes', handler)

        return () => {
            socket.off('receive-changes', handler);
        }
    }, [socket, quill])

    useEffect(() => {
        if (quill == null || socket == null) return;
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return; // only track changes made by the user
            socket.emit('send-changes', delta);
        }
        quill.on('text-change', handler)

        return () => {
            quill.off('text-change', handler);
        }
    }, [socket, quill])

    const wrapper = useCallback((wrapper) => {
        if (wrapper == null) return;
        wrapper.innerHTML = "";
        const editor = document.createElement('div');
        wrapper.append(editor);
        const quillConnection = new Quill(editor, { theme: 'snow', modules: { toolbar: TOOLBAR_OPTIONS } });
        quillConnection.disable();
        quillConnection.setText('Loading...');
        setQuill(quillConnection);
    }
    , []);

    return (
        <div id="container" ref={wrapper}></div>
    )
}

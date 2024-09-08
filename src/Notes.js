import './App.css';
import { Component, createRef } from 'react';

import { FaPlus } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';

class Notes extends Component {

    state = {
        notes: [],
        folder: "",
        openedNote: null,
        openedNoteIndex: -1,
        editingNote: false
    }
    quill = createRef();
    componentDidMount() {
        this.setState({ folder: this.props.folder })
        this.getNotes();
    }
    addNote() {
        Swal.fire({
            title: `Új ${this.state.folder} jegyzet`,
            text: "Cím:",
            input: "text",
            showDenyButton: true,
            denyButtonText: "Mégse",
            confirmButtonText: "Létrehozás",
            preConfirm: (title) => {
                if (!title) {
                    Swal.showValidationMessage("A cím nem lehet üres");
                    return false;
                }
                return title;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const title = result.value;
                const newNote = {
                    title: title,
                    content: "", // Start clean, can be edited later
                    creationDate: new Date().toISOString()
                };

                // Get existing notes from localStorage
                let notes = localStorage.getItem("neptune-notes");
                notes = notes ? JSON.parse(notes) : {};

                // Add new note to the specified folder
                if (this.state.folder) {
                    if (!notes[this.state.folder]) {
                        notes[this.state.folder] = []; // Create folder if it does not exist
                    }
                    notes[this.state.folder].push(newNote);
                } else {
                    // Handle case when no folder is specified (optional)
                    if (!notes["default"]) {
                        notes["default"] = [];
                    }
                    notes["default"].push(newNote);
                }

                // Save updated notes to localStorage
                localStorage.setItem("neptune-notes", JSON.stringify(notes));

                // Update state
                this.setState({ notes: notes[this.state.folder] || notes["default"] || [] });

                // Log for debugging
                console.log(`Folder: ${this.state.folder}, notes state: ${notes}`);
            }
        });
    }

    // Get all notes for the current folder
    getNotes() {
        const allNotes = localStorage.getItem("neptune-notes");
        if (allNotes) {
            const notes = JSON.parse(allNotes);
            this.setState({ notes: notes });
        } else {
            this.setState({ notes: [] });
        }
    }
    deleteNote(index) {
        let updatedNotes = { ...this.state.notes };

        // Check if the folder exists in the notes
        if (updatedNotes[this.state.folder]) {
            // Remove the note at the specified index
            updatedNotes[this.state.folder].splice(index, 1);

            // Update localStorage with the modified notes
            localStorage.setItem("neptune-notes", JSON.stringify(updatedNotes));

            // Update the state to trigger a re-render
            this.setState({ notes: updatedNotes });
        } else {
            console.error("Folder not found in notes");
        }
    }
    openNote(index, editing) {
        this.setState({ openedNote: this.state.notes[this.state.folder][index], editingNote: editing, openedNoteIndex: index })
    }
    updatedStorage(){

    }
    saveNote(){
        let updatedNote = this.state.openedNote;
        updatedNote.content = JSON.stringify(this.quill.current.value);
        
        let updatedNotes = this.state.notes;
        updatedNotes[this.state.folder][this.state.openedNoteIndex] = updatedNote;

        localStorage.setItem("neptune-notes", JSON.stringify(updatedNotes));
        this.setState({notes: updatedNotes})
    }
    render() {
        return (
            <div className='Notes menu'>
                <h1>{this.state.folder != "" ? `${this.state.folder} jegyzetek` : 'Jegyzetek'}</h1>
                {this.state.folder != "" &&
                    <div>
                        {this.state.notes[this.state.folder] ?
                            <div className='folder'>
                                {
                                    this.state.notes[this.state.folder].map((note, index) => (
                                        <div className='note-card' key={'note-' + index}>
                                            <div className='header' onClick={() => this.openNote(index, false)}>
                                                <p><b>{note.title}</b></p>
                                                <p><i>{note.creationDate.split("T")[0]}</i></p>
                                            </div>
                                            <div className='buttons'>
                                                <FaEdit onClick={() => this.openNote(index, true)} />
                                                <FaTrash onClick={() => this.deleteNote(index)} />
                                            </div>
                                        </div>
                                    ))
                                }
                                <div className='rounded-btn green'
                                    style={{ backgroundColor: "lightgreen", color: "lightgreen" }}
                                    onClick={() => this.addNote()}>
                                    <FaPlus />
                                    <p>Új jegyzet létrehozása</p>
                                </div>
                            </div>
                            :
                            <div className='no-notes'>
                                <p>Szeretnél létrehozni egy jegyzetet a/az <b>{this.state.folder}</b> mappába?</p>
                                <div className='rounded-btn green'
                                    style={{ backgroundColor: "lightgreen", color: "lightgreen" }}
                                    onClick={() => this.addNote()}>
                                    <FaPlus />
                                    <p>Új jegyzet létrehozása</p>
                                </div>
                            </div>}
                    </div>}
                {this.state.folder == "" &&
                    <div>
                        {
                            Object.keys(this.state.notes).map((folder, index) => (
                                <div className='note-card' key={'folder-' + index}
                                    onClick={() => this.setState({ folder: folder })}>
                                    <div className='header'>
                                        <p><b>{folder}</b></p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>}

                {this.state.openedNote != null &&
                    <div className='opened-note'>
                        <div className='note'>
                            <div className='header'>
                                <p><i>{this.state.openedNote.creationDate.split("T")[0]}</i></p>
                                {!this.state.editingNote ? <h2>{this.state.openedNote.title}</h2>
                                 :  
                                 <h2><i>{this.state.openedNote.title}*</i></h2>}
                                 <FaSave onClick={()=>this.saveNote()}/>
                                <FaXmark onClick={() => this.setState({ openedNote: null })} />
                            </div>
                            <div className='content'>
                            <ReactQuill value={JSON.parse(this.state.openedNote.content)} readOnly={!this.state.editingNote} ref={this.quill}/>
                            </div>
                        </div>
                    </div>}
            </div>
        );
    }
}

export default Notes;
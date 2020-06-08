import { Component, OnInit } from '@angular/core';
import * as $ from "jQuery";

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {
    SpeechRecognition: SpeechRecognition;
    recognition;
    noBrowserSupport: boolean = false;
    app: boolean = true;
    noteTextarea: string;
    instructions: string = "Press the Start Recognition button and allow access."
    notesList:string;

    noteContent: string = " ";

    constructor() { }

    ngOnInit(): void {
        try {
            this.SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true
        }
        catch (e) {
            console.error(e);
            this.noBrowserSupport = true
            this.app = false
        }
        // This block is called every time the Speech APi captures a line. 
        this.recognition.onresult = function (event) {

            // event is a SpeechRecognitionEvent object.
            // It holds all the lines we have captured so far. 
            // We only need the current one.
            var current = event.resultIndex;

            // Get a transcript of what was said.
            var transcript = event.results[current][0].transcript;

            // Add the current transcript to the contents of our Note.
            // There is a weird bug on mobile, where everything is repeated twice.
            // There is no official solution so far so we have to handle an edge case.
            var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

            if (!mobileRepeatBug) {
                this.noteContent += transcript;
                this.noteTextarea = this.noteContent;
            }
        };

        this.recognition.onstart = function () {
            this.instructions = 'Voice recognition activated. Try speaking into the microphone.';
        }

        this.recognition.onspeechend = function () {
            this.instructions = 'You were quiet for a while so voice recognition turned itself off.';
        }

        this.recognition.onerror = function (event) {
            if (event.error == 'no-speech') {
                this.instructions = 'No speech was detected. Try again.';
            };
        }

    }
       /*-----------------------------
        App buttons and input 
  ------------------------------*/

//   $('#start-record-btn').on('click', function (e) {
//     if (noteContent.length) {
//       noteContent += ' ';
//     }
//     recognition.start();
//   });
  startRecording(event):void{
      if(this.noteContent.length){
          this.noteContent+=" "
      }
      this.recognition.start()
  }


//   $('#pause-record-btn').on('click', function (e) {
//     recognition.stop();
//     instructions.text('Voice recognition paused.');
//   });
  pauseRecording(event):void{
      this.recognition.stop();
      this.instructions="Voice recognition paused."
  }

  // Sync the text inside the text area with the noteContent variable.
//   noteTextarea.on('input', function () {
//     noteContent = String($(this).val());
//   })
  syncNoteContent(value:string):void{
      this.noteContent=value
  }


//   $('#save-note-btn').on('click', function (e) {
//     recognition.stop();

//     if (!noteContent.length) {
//       instructions.text('Could not save empty note. Please add a message to your note.');
//     }
//     else {
//       // Save note to localStorage.
//       // The key is the dateTime with seconds, the value is the content of the note.
//       saveNote(new Date().toLocaleString(), noteContent);

//       // Reset variables and update UI.
//       noteContent = '';
//       renderNotes(getAllNotes());
//       noteTextarea.val('');
//       instructions.text('Note saved successfully.');
//     }

//   })
  saveNote(event):void{
    this.recognition.stop()
    if(!this.noteContent.length){
        this.instructions=("Could not save empty note. Please add a message to your note.")
    }else{
        //Save note to localStorage.
      // The key is the dateTime with seconds, the value is the content of the note.
    //   saveNote(new Date().toLocaleString(), noteContent);
      let storageKey:string=new Date().toLocaleString()
        localStorage.setItem("note- "+storageKey,this.noteContent)
      // Reset variables and update UI.
      this.noteContent = '';
    //   this.renderNotes(getAllNotes());
      this.noteTextarea="";
      this.instructions='Note saved successfully.';
    }
  }


//   notesList.on('click', function (e) {
//     e.preventDefault();
//     var target = $(e.target);

//     // Listen to the selected note.
//     if (target.hasClass('listen-note')) {
//       var content = target.closest('.note').find('.content').text();
//       readOutLoud(content);
//     }

//     // Delete note.
//     if (target.hasClass('delete-note')) {
//       var dateTime = target.siblings('.date').text();
//       deleteNote(dateTime);
//       target.closest('.note').remove();
//     }
//   });

  /*-----------------------------
          Speech Synthesis 
    ------------------------------*/

     readOutLoud(message:string):void {
        var speech = new SpeechSynthesisUtterance();
  
        // Set the text and voice attributes.
        speech.text = message;
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
  
        window.speechSynthesis.speak(speech);
      }
/*-----------------------------
          Helper Functions 
    ------------------------------*/

     renderNotes(notes:any[]) {
        var html = '';
        if (notes.length) {
          notes.forEach(function (note) {
            html += `<li class="note">
          <p class="header">
            <span #noteDate class="date">${note.date}</span>
            <a href="#" class="listen-note" title="Listen to Note" (click)="readOutLoud($event.target.value)">Listen to Note</a>
            <a href="#" class="delete-note" title="Delete" (click)="deleteNote(noteDate.value)">Delete</a>
          </p>
          <p class="content">${note.content}</p>
        </li>`;
          });
        }
        else {
          html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
        }
        this.notesList=html;
      }
  
  
    //   function saveNote(dateTime, content) {
    //     localStorage.setItem('note-' + dateTime, content);
    //   }
  
  
      getAllNotes():any[] {
        var notes = [];
        var key;
        for (var i = 0; i < localStorage.length; i++) {
          key = localStorage.key(i);
  
          if (key.substring(0, 5) == 'note-') {
            notes.push({
              date: key.replace('note-', ''),
              content: localStorage.getItem(localStorage.key(i))
            });
          }
        }
        return notes;
      }
      deleteNote(dateTime) {
        localStorage.removeItem('note-' + dateTime);
      }
  
}
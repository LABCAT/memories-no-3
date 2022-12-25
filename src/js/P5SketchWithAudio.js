import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/memories-no-3.ogg";
import midi from "../audio/memories-no-3.mid";
import image from "../images/Kunming-Garden-Spring-Pavilion-Pukekura-Park.jpg";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[1].notes; // Synth 1
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.img = p.loadImage(image);
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(255);
            p.img.resize(p.width / p.sizeDivisor,0);
            p.img.loadPixels();
            p.init();
            // p.noLoop();
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.strokeWeight(4);
            for (var i = 0; i < p.plateau.length; i++) {
                
                let size = (3 / p.abs(p.plateau[i].destX - p.plateau[i].x))
                if (size > 2) {
                    p.plateau[i].size = size
                }
                else
                    p.plateau[i].size = 2
                    p.strokeWeight(p.plateau[i].size)
                    p.stroke(p.plateau[i].colour);
                    p.circle(p.plateau[i].x, p.plateau[i].y,size);
                    p.plateau[i].x += (p.plateau[i].destX - p.plateau[i].x) * 0.2;
                    p.plateau[i].y += (p.plateau[i].destY - p.plateau[i].y) * 0.2;

                if (p.abs(p.plateau[i].destX - p.plateau[i].x) <= Math.random()){
                    let posX = Math.floor(Math.random() * p.width / p.sizeDivisor);
                    let posY = Math.floor(Math.random() * p.height / p.sizeDivisor);
                    p.plateau[i].destX = posX
                    p.plateau[i].destY = posY
                    p.plateau[i].x = posX -2
                    p.plateau[i].y = posY -2
                    p.plateau[i].color = p.img.get(p.plateau[i].destX, p.plateau[i].destY)
                }
            }
            }
        }

        p.plateau = [];

        p.sizeDivisor = 1;

        p.init = () => {
	        p.clear();
	        p.plateau = [];
            for (var i = 0; i < p.width  / p.sizeDivisor; i++){
                const destX = Math.floor(Math.random() * p.width / p.sizeDivisor),
                    destY = Math.floor(Math.random() * p.height / p.sizeDivisor);
                p.plateau.push(
                    {
                        x: Math.floor(Math.random() * p.width / p.sizeDivisor),
                        y: Math.floor(Math.random() * p.height / p.sizeDivisor),
                        destX: destX,
                        destY: destY,
                        colour: p.img.get(destX,destY),
                        size: 1,
                    }
                );
            }

        }

        p.executeCueSet1 = (note) => {
            
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;

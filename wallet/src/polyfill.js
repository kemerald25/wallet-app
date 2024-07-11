// src/polyfill.js
import { Buffer } from 'buffer';

// Polyfill the global Buffer
window.Buffer = window.Buffer || Buffer;

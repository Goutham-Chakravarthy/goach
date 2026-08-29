/**
 * A lightweight replacement for GSAP SplitText using runtime layout calculation.
 */
export class SplitTextReplacement {
  constructor(element, options = {}) {
    this.element = typeof element === "string" ? document.querySelector(element) : element;
    if (!this.element) return;
    
    this.options = options;
    this.originalHTML = this.element.innerHTML;
    this.originalText = this.element.textContent;
    
    this.lines = [];
    this.words = [];
    this.chars = [];
    
    this.split();
  }

  static create(element, options) {
    return new SplitTextReplacement(element, options);
  }

  split() {
    const type = this.options.type || "lines";
    const types = type.split(",").map(t => t.trim());
    
    // Split into words first to measure line wraps
    const wordsArray = this.originalText.split(/\s+/).filter(w => w.length > 0);
    this.element.innerHTML = "";
    
    const wordSpans = wordsArray.map(word => {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.style.whiteSpace = "pre";
      span.textContent = word + " ";
      if (this.options.wordsClass) {
        span.className = this.options.wordsClass;
      }
      this.element.appendChild(span);
      return span;
    });
    
    this.words = wordSpans;
    
    // Group into lines by offsetTop
    if (types.includes("lines")) {
      const lineGroups = [];
      let currentLine = [];
      let lastTop = -1;
      
      wordSpans.forEach(span => {
        const top = span.offsetTop;
        if (lastTop === -1 || Math.abs(top - lastTop) < 5) {
          currentLine.push(span);
        } else {
          lineGroups.push(currentLine);
          currentLine = [span];
        }
        lastTop = top;
      });
      if (currentLine.length > 0) {
        lineGroups.push(currentLine);
      }
      
      this.element.innerHTML = "";
      this.lines = lineGroups.map(lineWords => {
        const lineDiv = document.createElement("div");
        lineDiv.className = this.options.linesClass || "line";
        // To allow inner absolute positioning or masks:
        lineDiv.style.position = "relative";
        lineDiv.style.display = "block";
        
        lineWords.forEach(wordSpan => {
          lineDiv.appendChild(wordSpan);
        });
        this.element.appendChild(lineDiv);
        return lineDiv;
      });
    }
    
    // Handle characters if requested
    if (types.includes("chars")) {
      // Split each word into character spans
      const targets = this.words.length > 0 ? this.words : [this.element];
      this.chars = [];
      targets.forEach(target => {
        const text = target.textContent;
        target.innerHTML = "";
        for (let char of text) {
          const charSpan = document.createElement("span");
          charSpan.style.display = "inline-block";
          charSpan.textContent = char;
          if (this.options.charsClass) {
            charSpan.className = this.options.charsClass;
          }
          target.appendChild(charSpan);
          this.chars.push(charSpan);
        }
      });
    }
  }

  revert() {
    if (this.element) {
      this.element.innerHTML = this.originalHTML;
    }
  }
}

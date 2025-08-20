/*!
 * Progressive Enhancement v3 - Custom Validation with real-time feedback
 * ~1.5KB minified
 */
!function() {
  "use strict";
  
  var docElement = document.documentElement;
  
  if ("classList" in docElement) {
    // Enable JS
    docElement.classList.remove("no-js");
    docElement.classList.add("js-enabled");
    
    // Process forms
    document.querySelectorAll("form.pe-form").forEach(function(form) {
      // Disable native validation
      form.setAttribute("novalidate", "");
      
      // Add validation handlers to fields
      form.querySelectorAll("input, textarea, select").forEach(function(field) {
        // Add touched class on input for real-time border validation
        field.addEventListener("input", function() {
          field.classList.add("touched");
        });
        
        // Add blurred class on blur for error message display
        field.addEventListener("blur", function() {
          field.classList.add("touched");
          field.classList.add("blurred");
        });
      });
      
      // Handle form submission
      form.addEventListener("submit", function(e) {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
          form.classList.add("was-validated");
          
          // Mark all fields as touched and blurred for error display
          form.querySelectorAll("input, textarea, select").forEach(function(field) {
            field.classList.add("touched");
            field.classList.add("blurred");
          });
          
          // Focus first invalid field
          var firstInvalid = form.querySelector(":invalid");
          if (firstInvalid) {
            firstInvalid.focus({ preventScroll: false });
          }
          
          return false;
        }
        
        // Handle submit button state
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.disabled = true;
          submitBtn.setAttribute("aria-busy", "true");
          submitBtn.classList.add("button--loading");
          
          var btnText = submitBtn.querySelector(".button-text");
          if (btnText) {
            btnText.dataset.orig = btnText.textContent;
            btnText.textContent = form.classList.contains("pe-form--newsletter") 
              ? "Subscribing..." 
              : "Sending...";
          }
        }
      });
      
      // Set timestamp for spam protection
      var timestampField = form.querySelector('input[name="timestamp"]');
      if (timestampField) {
        timestampField.value = Date.now().toString();
      }
    });
    
    // Handle tab navigation
    var tabContainer = document.querySelector(".form-tabs-container");
    if (tabContainer) {
      // Handle tab change
      tabContainer.addEventListener("change", function(e) {
        if (e.target && e.target.name === "form-tab") {
          // Update ARIA attributes
          this.querySelectorAll(".form-tab").forEach(function(tab) {
            var radio = document.getElementById(tab.getAttribute("for"));
            tab.setAttribute("tabindex", radio && radio.checked ? "0" : "-1");
          });
          
          // Focus the panel
          var panelId = e.target.id.replace("tab-", "panel-");
          var panel = document.getElementById(panelId);
          if (panel) {
            panel.focus();
          }
        }
      });
      
      // Handle keyboard navigation
      var tabs = tabContainer.querySelectorAll(".form-tab");
      tabs.forEach(function(tab) {
        tab.addEventListener("keydown", function(e) {
          var newTab = null;
          var currentIndex = Array.from(tabs).indexOf(this);
          
          switch(e.key) {
            case "ArrowLeft":
            case "ArrowUp":
              e.preventDefault();
              newTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
              break;
            case "ArrowRight":
            case "ArrowDown":
              e.preventDefault();
              newTab = tabs[currentIndex + 1] || tabs[0];
              break;
            case "Home":
              e.preventDefault();
              newTab = tabs[0];
              break;
            case "End":
              e.preventDefault();
              newTab = tabs[tabs.length - 1];
              break;
          }
          
          if (newTab) {
            var radio = document.getElementById(newTab.getAttribute("for"));
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(new Event("change", { bubbles: true }));
            }
            newTab.focus();
          }
        });
      });
    }
  }
}();
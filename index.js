
//define constants
const JG_HONEYPOT_DIVERTER_STRING = jg_generate_random_string(12) //string to append to the front of inputs to divert bots from detecting honeypots
const JG_HONEYPOT_CLASSNAME = "jg_honeypot"                    //classname to hide honeypot inputs
const JG_HONEYPOT_FORM_CLASSNAME = "jg_honeypot_form"          //classname applied to forms honeypot inputs should be added to
const JG_HONEYPOT_GOOD_INPUT_MARKER = "jg_honeypot_good_input" //class automatically applied to inputs that were renamed so we know to reset their names on form submit
const JG_HONEYPOT_STATUS_INPUT = "jg_honeypot_suspects_bot"             //name of the input added automatically that tells whether a honeypot input was filled out, check this on your server!
const JG_HONEYPOT_SUBMIT_KEY = "jg_honeypot_submit"                        //key to mark that the form should be submitted by honeypot

const JG_HONEYPOT_STYLE = `
.${JG_HONEYPOT_CLASSNAME} {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 0;
    width: 0;
    z-index: -1;
}
`   //styling to hide the honeypot input


//this init function is called in jg.js, do not call it directly!
export default function __init_jg_honeypot(e){
    //add spin animation style to the document
    let honeypot_style = document.createElement('style')
    honeypot_style.innerText = JG_HONEYPOT_STYLE
    document.head.appendChild(honeypot_style)
    //add honeypot inputs
    jg_add_honeypots()
}

/*
This function adds honeypot inputs to all forms with the classname in JG_HONEYPOT_FORM_CLASSNAME.
It adjusts the names of all real inputs to distract bots from them, then it creates new honeypot inputs with those names
in the form.  When the form is submitted, it adds a field to indicate whether the honeypot check failed, called the string
in JG_HONEYPOT_STATUS_INPUT, then removes all the honeypot inputs and submits the form.
*/

function jg_add_honeypot_input_copies(form, inputs){
    //remove previous honeypot status inputs
    const status_inputs = Array.from(form.querySelectorAll(`input[name="${JG_HONEYPOT_STATUS_INPUT}"]`)); //get all status inputs for honeypot check
    status_inputs.map((input)=>{ input.remove() })

    inputs.map((input)=>{
        //add honeypot input copies of them
        let hp_input = document.createElement('input')
        hp_input.type = input.type
        hp_input.autocomplete = "off"
        hp_input.name = input.name
        hp_input.classList.add(JG_HONEYPOT_CLASSNAME)
        form.appendChild(hp_input)

        //change their names with a string
        input.name = JG_HONEYPOT_DIVERTER_STRING + input.name
        input.classList.add(JG_HONEYPOT_GOOD_INPUT_MARKER)

    })
}


function jg_add_honeypots(){
    //get forms
    let forms = Array.from(document.querySelectorAll("." + JG_HONEYPOT_FORM_CLASSNAME))

    //for each form...
    forms.map((form)=>{
        //add honeypot input copies of text or email inputs
        let inputs = Array.from(form.querySelectorAll('input[type="email"], input[type="text"]'))
        jg_add_honeypot_input_copies(form, inputs)

        //add one extra honeypot text field for good measure (in case there are no text or email inputs)
        let honeypot = document.createElement('input')
        honeypot.type = "text"
        honeypot.autocomplete = "off"
        honeypot.name = "jg_honeypot"
        honeypot.classList.add(JG_HONEYPOT_CLASSNAME)
        form.appendChild(honeypot)

        //add onsubmit event listener to form to...
        form.addEventListener('submit', (event)=>{
            event.preventDefault()
            
            let suspects_bot = false //whether the honeypot check failed
            let inputs = Array.from(form.querySelectorAll('input[type="email"], input[type="text"]'))
            inputs.map((input)=>{   //inputs is fromt the beginning of this function
                //check and remove honeypot inputs
                if (input.classList.contains(JG_HONEYPOT_CLASSNAME)){
                    if (input.value != "") suspects_bot = true
                    input.remove()
                }
                //return names of old inputs to their originals
                else{
                    if (input.classList.contains(JG_HONEYPOT_GOOD_INPUT_MARKER)){
                        input.name = input.name.substring(JG_HONEYPOT_DIVERTER_STRING.length)   //return input name to its original value
                    }
                }
            })

            //check default honeypot input
            if (honeypot.classList.contains(JG_HONEYPOT_CLASSNAME)){    //"honeypot" is defined earlier in the function
                if (honeypot.value != "") suspects_bot = true
                honeypot.remove()
            }
            
            //add input for whether the the honeypot check failed
            let hp_suspects_bot_input = document.createElement('input')
            hp_suspects_bot_input.type = 'hidden'
            hp_suspects_bot_input.name = JG_HONEYPOT_STATUS_INPUT
            form.appendChild(hp_suspects_bot_input)
            if (suspects_bot){
                hp_suspects_bot_input.value = true
            }else{
                hp_suspects_bot_input.value = false
            }


            //submit the form
            if (!event.jg_submitted && event.jg_form_submit == JG_HONEYPOT_SUBMIT_KEY){
                console.log("honeypot form submit")
                event.jg_submitted = true
                event.target.submit()
            }

        }, false)

        //during the capture phase, mark that the form should be submitted by honeypot (this will fire before ajax and stripe due to the event listener order in jg.js)
        form.addEventListener('submit', (event)=>{
            event.jg_form_submit = JG_HONEYPOT_SUBMIT_KEY
        }, true)
    })
}

function jg_generate_random_string(length) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let random_string = '';
    
    for (let i = 0; i < length; i++) {
      const random_index = Math.floor(Math.random() * alphabet.length);
      random_string += alphabet.charAt(random_index);
    }
    
    return random_string;
  }
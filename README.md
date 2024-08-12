# JG Honeypot
jg_honeypot.js adds invisible inputs, called honeypots, to forms to help limit spam submissions, while at the same time maintaining a positive user experience.  The idea is that we style the inputs in such a way that the user would not be able to see them to fill them out.  But, bots will see them in the html source and fill them out.  Then, when the form is submittted, the script checks if any of the honeypots trapped a bot, and notifies the server through the use of the *jg_honeypot_suspects_bot* input name in the request.  The server can read from this input to decide whether it will fulfill the request or not.

To use the features of this script, all you need to do is apply the *jg_honeypot_form* class to the form element you wish to enable spam protection for.  From there, jg_honeypot.js will handle the rest.  

```html
<form action="/" method="POST" class="jg_honeypot_form">
    <label for="name_input">Name</label>
    <input type="text" id="name_input" name="name">

    <label for="email_input">Email</label>
    <input type="email" id="email_input" name="email">

    <label for="message_input">Message</label>
    <input type="text" id="message_input" name="message">

    <input type="submit" value="submit">
</form>
```

Note that if you inspect a form protected by jg_honeypot.js, the name atttributes of your original inputs will be changed.  This is normal, it is jg_honeypot.js masking the true names of those inputs to bots so that the honeypot inputs look more appealing to them.  Upon submitting the form, jg_honeypot.js will automatically rectify the input names so your form works as expected.

** NOTE: if you use this script in tandem with either JG Stripe Form or JG Ajax Form, I highly recommend using this script to initialize all event listeners: https://github.com/jtgraham38/JGJS_Synchronizer **
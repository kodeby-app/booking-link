# Booking Link

Make your own booking page in two minutes. Customers pick a free time and send you the request. Free, no sign-up, and no server.

An example app made by the Kodeby team and listed on [kodeby.app](https://kodeby.app).

## What it does

- Set your name, a short welcome and where you meet
- Add the meeting types people can book, each with its own length
- Set your opening hours for each weekday, your time zone and how far ahead people can book
- Block holidays and busy days
- Copy your booking link and share it on your website, in your email signature or on social media
- Customers see free times in their own time zone, pick one, and send you the request by email
- They can add the requested time to their own calendar (.ics)
- English and Norwegian

## How it works without a server

Your settings are stored in your browser and packed into the booking link, in the part after `#`. Browsers never send that part to a server.
When a customer sends a request, it opens their own email app with the request filled in, addressed to you. You confirm the time yourself.

Because nothing is stored centrally, the page cannot see your calendar or stop two people from asking for the same time. It is meant for small businesses and freelancers who confirm bookings by hand.
Your email address is part of the booking link, so anyone with the link can see it.

## Privacy

There is no server, no account, no analytics and no cookies.
The Content Security Policy in `vercel.json` blocks all network requests from the page (`connect-src 'none'`). Only kodeby.app may show the page in a frame, for the "Try it here" demo on its app page.

## Run locally

It is plain HTML, CSS and JavaScript with no build step:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Import the repository in Vercel with the default settings (Framework preset: Other, no build command).

## License

MIT

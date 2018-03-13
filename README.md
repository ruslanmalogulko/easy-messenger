## Easy chat app

### Basic info

Chat built on the basis of `create-react-app` with socket.io.
Supporting direct messages if text contains `@<user_name>`.

### Docker

```
// make sure docker installed and docker daemon is running
docker image build -t react:app .
docker container run -it -p 3000:3000 -p 35729:35729 -v $(pwd):/app react:app
```

### Heroku

You can find already running application here:
https://easy-messenger.herokuapp.com[https://easy-messenger.herokuapp.com]


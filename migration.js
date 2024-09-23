import Users from "./models/Users.js";
import Events from "./models/Events.js";
import Media from "./models/Media.js";
import Chat from "./models/Chat.js";

const models = [
    Users,
    Events,
    Media,
    Chat

];

(async () => {
    for (const model of models) {
        await model.sync({alter: true})
        console.log(model.name,'TABLE CREATED SUCCESSFULLY')
    }

})();
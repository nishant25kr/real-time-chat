import { Store } from "./Store.js";

const store = new Store()

store.initRoom("room1");

store.addChat("u1", "Nishant", "room1", "Hello World");
store.addChat("u2", "Rahul", "room1", "Hi Nishant");

const chats = store.getChats("room1", 10, 0);
console.log(chats);
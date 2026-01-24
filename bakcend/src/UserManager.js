
export class UserManager{
    constructor(){
        this.rooms = new Map();
    }

    addUser(name, userId, roomId, socket){
        if(!this.rooms.get(roomId)){
            this.rooms.set(roomId,{
                users:[]
            })
        }
        this.rooms.get(roomId)?.users.push({
            id: userId,
            name
        })
    }

    removeUser(roomId,userId){
        
    }
}
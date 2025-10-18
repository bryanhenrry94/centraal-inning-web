interface ChatWindowProps {
  room: ISelectedRoom;
  fullname: string;
  email: string;
}

interface ISelectedRoom {
  id: string;
  description: string;
}
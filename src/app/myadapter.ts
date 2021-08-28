import { AngularFireDatabase } from '@angular/fire/database';
import { ChatAdapter, IChatParticipant, Message, ParticipantResponse } from 'ng-chat';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

export class MyAdapter extends ChatAdapter {

    userId: any = 0;
    participants: IChatParticipant[] = [];

    constructor(private db: AngularFireDatabase, userId: number) {
        super();
        this.userId = userId;
        // this.initialize();
    }

    initialize() {

        this.db.list('messages', (query) => query.orderByChild('dateSeen').equalTo(0))
            .snapshotChanges()
            .pipe(
                map(changes => {
                    const messages = changes.map(x => {
                        const message: any = x.payload.val() as Message;
                        if (message.toId == this.userId) {
                            message.dateSeen = new Date().getTime();
                            this.db.list('messages').update(x.key as string, message);
                            message.dateSeen = new Date(message.dateSeen);
                            message.dateSent = new Date(message.dateSent);
                        }
                        return message as Message;

                    }).filter(x => {
                        return (x.toId == this.userId);
                    });
                    return messages;
                })
            ).subscribe((messages) => {

                messages.forEach(m => {
                    const participant = this.participants.find(x => x.id == m.fromId) as IChatParticipant;
                    this.onMessageReceived(participant, m);
                });
            })

    }

    listFriends(): Observable<ParticipantResponse[]> {

        return this.db.list('participants')
            .valueChanges()
            .pipe(
                map(changes => {
                    const participants = changes.map((participant) => {
                        // console.log(participant);
                        return {
                            participant, metadata: {
                                totalUnreadMessages: 0
                            }
                        } as ParticipantResponse;
                    }).filter(x => x.participant.id != this.userId);
                    this.participants = participants.map(x => x.participant);

                    this.initialize();
                    return participants;
                }),
                take(1)
            )
        return new Observable((participants) => {
            return participants.next([
                {
                    participant: {
                        avatar: 'assets/avatar.png',
                        displayName: 'Usuário 1',
                        id: 2,
                        participantType: 0,
                        status: 1
                    },
                    metadata: {
                        totalUnreadMessages: 1
                    }
                },
                {
                    participant: {
                        avatar: 'assets/avatar.png',
                        displayName: 'Usuário 1',
                        id: 3,
                        participantType: 0,
                        status: 0
                    },
                    metadata: {
                        totalUnreadMessages: 3
                    }
                },
            ]);
        })
    };

    // onMessageReceived(){
    //     console.log('recebendo');
    // }



    getMessageHistory(destinataryId: any): Observable<Message[]> {
        // return this.db.list('messages', (query) => query.orderByChild('toId').equalTo(destinataryId))
        // return of([]);
        return this.db.list('messages', (query) => query.orderByChild('dateSeen').startAt(0))
            .valueChanges()
            .pipe(
                map(changes => {
                    const messages = changes.map(x => {
                        const message: any = x as Message;
                        message.dateSent = new Date(message.dateSent);
                        message.dataSeen = new Date(message.dataSeen);
                        return message as Message;
                    }).filter(x => {
                        return (x.toId == destinataryId && x.fromId == this.userId)
                            || (x.toId == this.userId && x.fromId == destinataryId)
                    });
                    return messages;
                }),
                take(1)
            )

        return new Observable((participants) => {

            return participants.next([
                {
                    fromId: 1,
                    message: 'Boa tarde. Como você está?',
                    toId: 2,
                    dateSent: new Date()
                },
                {
                    fromId: 2,
                    message: 'Boa tarde. Estou bem e você?',
                    toId: 1,
                    dateSent: new Date()
                }
            ]);
        })
    };

    sendMessage(message: Message): void {
        // this.db.list('participants').push({
        //     avatar: 'assets/avatar.png',
        //     displayName: 'Usuário 1',
        //     id: 1,
        //     participantType: 0,
        //     status: 1
        // })
        // this.db.list('participants').push({
        //     avatar: 'assets/avatar.png',
        //     displayName: 'Usuário 2',
        //     id: 2,
        //     participantType: 0,
        //     status: 1
        // });
        // this.db.list('participants').push({
        //     avatar: 'assets/avatar.png',
        //     displayName: 'Usuário 3',
        //     id: 3,
        //     participantType: 0,
        //     status: 1
        // });;
        (message.dateSent as any) = message.dateSent?.getTime();
        (message.dateSeen as any) = 0
        this.db.list('messages').push(message)
            .then((result: any) => {
            });
    };
}
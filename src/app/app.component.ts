import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ChatAdapter, Localization, Theme } from 'ng-chat';
import { MyAdapter } from './myadapter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'chat';
  userId: any = sessionStorage.getItem('userId');
  theme: Theme = Theme.Dark
  localization: Localization = {
    title: 'Amigos',
    browserNotificationTitle: 'Nova mensagem para',
    loadMessageHistoryPlaceholder: 'Carregar mensagens antigas',
    messagePlaceholder: 'Digite uma mensagem',
    searchPlaceholder: 'Pesquisar',
    statusDescription: {
      away: 'Inativo',
      busy: 'Ocupado',
      offline: 'Offline',
      online: 'Online'
    }
  }

  constructor(private db: AngularFireDatabase) {
  }

  public adapter: ChatAdapter = new MyAdapter(this.db, this.userId);

  changeUser(value: any) {
    this.userId = value;
    sessionStorage.setItem('userId', value);
  }

}


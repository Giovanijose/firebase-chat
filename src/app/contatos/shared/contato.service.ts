import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Contato } from './contato';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContatoService {

  constructor(private db: AngularFireDatabase) { }

  insert(contato: Contato) {
    this.db.list('participants').push(contato)
      .then((result: any) => {
        console.log(result.key);
      });
  }

  update(contato: Contato, key: string) {
    this.db.list('participants').update(key, contato)
      .catch((error: any) => {
        console.error(error);
      });
  }

  getAll() {
    return this.db.list('participants')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(c => ({ key: c.payload.key, ...c.payload.val() as {} }));
        })
      );
  }

  delete(key: string) {
    this.db.object(`contato/${key}`).remove();
  }
}
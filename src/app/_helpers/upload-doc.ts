import {UploadItem} from './uploader/upload-item';
import {environment} from '../../environments/environment';
import { UserService } from '../_services/user.service';

export class UploadDoc extends UploadItem {
  public host: string;
    constructor(
      file: any, 
      private userService: UserService,
      url: string
      ) {   
        super(); 
        this.host = environment.host;
        this.url = this.host + url;
        this.headers = { Authorization:  'Bearer ' + this.userService.getAuthToken() };
        this.file = file;
       
    }
}
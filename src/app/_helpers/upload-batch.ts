import {UploadItem} from './uploader/upload-item';
import {environment} from '../../environments/environment';
import { UserService } from '../_services/user.service';

export class UploadBatch extends UploadItem {
  public host: string;
    constructor(file: any, private userService: UserService) {  
     
        super(); 
        this.host = environment.host;
        this.url = this.host + '/dwl/customer/payment-link/create/batch';
        this.headers = { Authorization:  'Bearer ' + this.userService.getAuthToken() };
        this.file = file;
       
    }
}
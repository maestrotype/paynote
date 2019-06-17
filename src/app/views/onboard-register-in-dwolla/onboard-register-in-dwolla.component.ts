import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

import {UserService} from '../../_services/user.service';
import {StatesService} from '../../_services/states.service';
import {ErrorService} from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';

import {validateBirthDate} from '../../_vaidators/birthDate';
import {validateUrlSite} from '../../_vaidators/urlSite';
import {validateFirstName, validateBussinesName, validateLastName} from '../../_vaidators/fullName';
import {MessagesService} from '../../_services/messages.service';
import {Utility} from '../../_helpers/utility';

import {TopAlertsService} from '../../_services/top-alerts.service';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-onboard-register-in-dwolla',
  templateUrl: './onboard-register-in-dwolla.component.html',
  styleUrls: ['./onboard-register-in-dwolla.component.css'],
  providers: [ErrorService]
})
export class OnboardRegisterInDwollaComponent implements OnInit {

  minDate = new Date(1918, 0, 1);

  @ViewChild('stepper') stepper;
  @ViewChild('stepper2') stepper2;

  public host: string = environment.host;
  arrBusinessTypes: any;
  arrBusinessStructures: any;
  dtp: any;
  arrStates: any;
  arrCountries: any;
  arrBusinessClassification: any;
  arrBusinessClassificationMap: any = [];
  isPersonalAccount = true;
  isBusinessAccount = false;
  isRequireBusController = false;
  isRequireControllerPassport = false;
  isRequireBeneficiarPassport = false;
  showPopupSteper1 = true;
  showPopupSteper2 = false;
  canShowContinueButton = false;
  canContinueSignUp = true;
  maskEIN: any = [/\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  public maskDateBirth: any = {
    guide: true,
    showMask: true,
    mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
  };
  public maskPhone: any = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  isDebugMode: boolean = environment.dubugModeForRegDwolla;
  isLoading = false;
  isSuccess: boolean;
  isOfficerSameAsOwner = false;

  public businessTypeFormGroup: FormGroup;
  personalFormGroupFirst: FormGroup;
  personalFormGroupSecond: FormGroup;

  businesFormGroup: FormGroup;
  businesFormGroupStep1: FormGroup;
  businesFormGroupStep2: FormGroup;

  controllerBusinessFormGroup: FormGroup;
  controllerBusinessFormGroupStep1: FormGroup;
  controllerBusinessFormGroupStep2: FormGroup;
  controllerPassportBusinessFormGroup: FormGroup;
  beneficiarFormGroup: FormGroup;
  businessClassificationOptions: Observable<string[]>;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private _formBuilder: FormBuilder,
    private _stateService: StatesService,
    public jqueryService: JqueryService,
    public errorService: ErrorService,
    public messages: MessagesService,
    public utility: Utility,
    public topAlertsService: TopAlertsService,
  ) {}

  ngOnInit() {
    this.userService.initUser();

    if (!this.userService.isAdmin() && !this.userService.isSuperAdmin() ) {
      this.getBusinessClassification();
    }

    this.arrBusinessTypes = [
      {value: 'personal', name: 'Personal'},
      {value: 'business', name: 'Business'}
    ];
    this.dtp = [
      {value: 'http://', name: 'http://'},
      {value: 'https://', name: 'https://'}
    ];

    this.arrBusinessStructures = [
      {value: 'corporation', name: 'Corporation'},
      {value: 'llc', name: 'LLC'},
      {value: 'partnership', name: 'Partnership'},
      {value: 'soleProprietorship', name: 'Sole Proprietorship'}
    ];

    this.arrStates = this._stateService.arrStates;
    this.arrCountries = this._stateService.arrCountrise;

    this.businessTypeFormGroup = this._formBuilder.group({
      type: ['', Validators.required]
    });

    this.personalFormGroupFirst = this._formBuilder.group({
      firstName: ['', Validators.compose([Validators.required, validateFirstName]) ],
      lastName: ['', Validators.compose([ Validators.required, validateLastName])],
      email: [''],
      phone: [''],
      dateOfBirth: ['', Validators.compose([Validators.required, validateBirthDate])],
      ssn: ['', Validators.required]
    });
    this.personalFormGroupFirst.get('email').disable();
    this.personalFormGroupFirst.get('phone').disable();
    this.personalFormGroupSecond = this._formBuilder.group({
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
    });

    this.businesFormGroupStep1 = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      businessName: ['', Validators.compose( [Validators.required, validateBussinesName] )],
      doingBusinessAs: [''],
      businessType: ['', Validators.required],
      businessClassification: ['', Validators.required],
      businessClassificationFilter: [''],
      ein: ['', Validators.required],
      dataTransferProtocol: ['http://', Validators.required],
      website: ['', Validators.compose([Validators.required, validateUrlSite])],
      dateOfBirth: ['', Validators.compose([Validators.required, validateBirthDate])],
      ssn: ['', Validators.required]
    });
    this.businesFormGroupStep2 = this._formBuilder.group({
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
    });

    this.controllerBusinessFormGroupStep1 = this._formBuilder.group({
      isOfficerSameAsOwner: [false],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.compose([Validators.required, validateBirthDate])],
      ssn: ['', Validators.required],
      title: ['', Validators.required],
    });
    this.controllerBusinessFormGroupStep2 = this._formBuilder.group({
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      stateProvinceRegion: ['', Validators.required],
      postalCode: [''],
      country: ['US', Validators.required]
    });

    this.controllerPassportBusinessFormGroup = this._formBuilder.group({
      number: ['', Validators.required],
      country: ['US', Validators.required]
    });

    ////////////// Beneficiar Owner //////////////////////

    this.beneficiarFormGroup = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.compose([Validators.required, validateBirthDate])],
      ssn: ['', Validators.required],
      isBeneficialSameAsOfficer: [false],
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      stateProvinceRegion: ['', Validators.required],
      postalCode: [''],
      country: ['US', Validators.required],
      number: ['', Validators.required],
      passportCountry: ['US', Validators.required]
        });

//    this.beneficiarAddressFormGroup = this._formBuilder.    group({
//      address1: ['', Validators.req    uired],
//      address2    : [''],
//      city: ['', Validators.req    uired],
//      stateProvinceRegion: ['', Validators.req    uired],
//      postalCode    : [''],
//      country: ['US', Validators.re    quired]
//        })

//    this.beneficiarPassportGroup = this._formBuilder.grou    p({
//      number: ['', Validators.require    d],
//      country: ['US', Validators.requir    ed]
//    })

    //////////////////////////////////////////////////////

    this.autoFillCustomerData();

    this.businessClassificationOptions = this.businesFormGroupStep1.get('businessClassificationFilter').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value.toLowerCase()))
      );
  }

  private _filter(filterValue: string): string[] {
    const arrBusinessClassificationMap: any = {};
    const arrBusinessClassification = this.arrBusinessClassification.map(x => Object.assign([], x));

    arrBusinessClassification.forEach((element: any) => {
      element.list = element.list.filter(function (item: any) {
        arrBusinessClassificationMap[item.name] = item.id;
        return item.name.toLowerCase().indexOf(filterValue) >= 0;
      });
    });

    this.arrBusinessClassificationMap = arrBusinessClassificationMap;

    return arrBusinessClassification.filter(function (element: any) {
      return element.list.length > 0;
    });
  }


  changeStep(index: number) {
    if (!this.stepper) {
      return;
    }
    this.stepper.selectedIndex = index;
  }
  changeStepBeneficiarForm(index: number) {
    if (!this.stepper2) {
      return;
    }
    this.stepper2.selectedIndex = index;
  }

  selectVerifiedAccountType(strAccountType: string) {
    if (strAccountType === 'personal' && !this.userService.isPersonalSignupApprove() && this.userService.isMerchant() ) {
      this.canContinueSignUp = false;
      this.lockPerconalAccount();
      this.errorService.getMessageError({message: this.messages.get('PERSONAL_SIGNUP_LOCK')});
      setTimeout(() => {this.userService.logout(); }, 10000);
    } else {
      this.businessTypeFormGroup.patchValue({type: strAccountType});
      this.changeAccountType({value: strAccountType});
      this.changeStep(1);
    }
  }

  lockPerconalAccount() {
    const objRequest = {
      u_token: this.userService.getToken()
    };
    this.http.post<any>(this.host + '/customer/personal/signup/lock', objRequest)
      .subscribe(
        response => {
          if (response.success) {

          }
        },
        err => {
          console.log(err);
        }
      );
  }

  autoFillCustomerData() {
    this.personalFormGroupFirst.patchValue({
      firstName: this.userService.getFirstName(),
      email: this.userService.getEmail(),
      lastName: this.userService.getLastName(),
      phone: this.userService.getPhone() ? this.userService.getPhone().replace(/[^0-9]*/g, '') : '',

    });

    this.businesFormGroupStep1.patchValue({
      firstName: this.userService.getFirstName(),
      email: this.userService.getEmail(),
      lastName: this.userService.getLastName(),
      phone: this.userService.getPhone().replace(/[^0-9]*/g, ''),
    });

    if (this.isDebugMode) {
      this.personalFormGroupFirst.patchValue({
        //        address1: 'test 22 test',
        //        address2: 'test',
        //        city: 'TEST',
        //        state: 'FL',
        //        postalCode: '12345',
        dateOfBirth: new Date(1986, 2, 10),
        ssn: '1234'
      });
      this.personalFormGroupSecond.patchValue({
        address1: 'test 22 test',
        address2: 'test',
        city: 'TEST',
        state: 'FL',
        postalCode: '12345',
        //        dateOfBirth: new Date(1968, 10, 10),
        //        ssn: '1234'
      });

      this.businesFormGroupStep1.patchValue({
        businessName: 'test business name',
        doingBusinessAs: 'test test',
        businessType: 'soleProprietorship',
        businessClassification: '9ed3f670-7d6f-11e3-b1ce-5404a6144203',
        dataTransferProtocol: 'http://',
        website: 'www.test.com',
        ein: '12-4567890',
        dateOfBirth: new Date(1968, 10, 10),
        ssn: '1234'
      });

      this.controllerBusinessFormGroupStep1.patchValue({
        isOfficerSameAsOwner: true,
        firstName: this.userService.getFirstName(),
        lastName: this.userService.getLastName(),
        dateOfBirth: new Date(1968, 10, 10),
        ssn: '1234',
        title: 'test business name',
      });

      this.controllerBusinessFormGroupStep2 = this._formBuilder.group({
        address1: 'test 22 test',
        address2: 'test',
        city: 'TEST',
        stateProvinceRegion: 'FL',
        postalCode: '12345',
        country: 'US'
      });

      this.businesFormGroupStep2.patchValue({
        address1: 'test 22 test',
        address2: 'test 33 test',
        city: 'test',
        state: 'FL',
        postalCode: '12345'
      });

      this.controllerPassportBusinessFormGroup.patchValue({
        number: '12345',
        country: 'US'
      });

      this.beneficiarFormGroup.patchValue({
        isBeneficialSameAsOfficer: false,
        firstName: this.userService.getFirstName(),
        lastName: this.userService.getLastName(),
        dateOfBirth: new Date(1968, 10, 10),
        ssn: '1234',

        address1: 'test 22 test',
        address2: 'test',
        city: 'TEST',
        stateProvinceRegion: 'FL',
        postalCode: '12345',
        country: 'US',

        number: '12345',
        passportCountry: 'US'
      });

      //      this.beneficiarAddressFormGroup = this._formBuilder.group({
      //        address1: 'test 22 test',
      //        address2: 'test',
      //        city: 'TEST',
      //        stateProvinceRegion: 'FL',
      //        postalCode: '12345',
      //        country: 'US'
      //      })
      //
      //      this.beneficiarPassportGroup.patchValue({
      //        number: '12345',
      //        country: 'US'
      //      })
    }

    const objDwollaUser = this.userService.getDwollaCustomer();
    if (objDwollaUser) {
      if (this.isDebugMode) {
        return;
      }
      const objDwollaCustomer = objDwollaUser.dwl_customer;
      if (this.userService.isIndividualAccount()) {
        this.personalFormGroupSecond.patchValue({
          address1: objDwollaCustomer.address1 || '',
          address2: objDwollaCustomer.address2 || '',
          city: objDwollaCustomer.city || '',
          state: objDwollaCustomer.state || '',
          postalCode: objDwollaCustomer.postal_code || '',
        });
      } else {
        this.businesFormGroupStep2.patchValue({
          address1: objDwollaCustomer.address1 || '',
          address2: objDwollaCustomer.address2 || '',
          city: objDwollaCustomer.city || '',
          state: objDwollaCustomer.state || '',
          postalCode: objDwollaCustomer.postal_code || '',
        });
        this.businesFormGroupStep1.patchValue({
          businessName: objDwollaCustomer.business_name || '',
          doingBusinessAs: objDwollaCustomer.doing_business_as || '',
          website: objDwollaCustomer.website || ''
        });
        if (objDwollaCustomer.controller) {
          const objController = objDwollaCustomer.controller;
          this.controllerBusinessFormGroupStep1.patchValue({
            address1: objController.address1 || '',
            address2: objController.address2 || '',
            city: objController.city || '',
            state: objController.state || '',
            postalCode: objController.postal_code || '',
          });
          this.controllerBusinessFormGroupStep2.patchValue({
            address1: objController.address1 || '',
            address2: objController.address2 || '',
            city: objController.city || '',
            state: objController.state || '',
            postalCode: objController.postal_code || '',
          });
        }
      }
    }

  }

  changeOfficerSameAsOwner() {
    if (this.controllerBusinessFormGroupStep1.value.isOfficerSameAsOwner) {
      this.controllerBusinessFormGroupStep1.patchValue({
        firstName: this.businesFormGroupStep1.value.firstName,
        lastName: this.businesFormGroupStep1.value.lastName,
        dateOfBirth: this.businesFormGroupStep1.value.dateOfBirth,
//        ssn: this.businesFormGroupStep1.value.ssn,
      });

      this.controllerBusinessFormGroupStep2.patchValue({
        address1: this.businesFormGroupStep2.value.address1,
        address2: this.businesFormGroupStep2.value.address2,
        city: this.businesFormGroupStep2.value.city,
        stateProvinceRegion: this.businesFormGroupStep2.value.state,
        postalCode: this.businesFormGroupStep2.value.postalCode,
      });
    } else {
      this.controllerBusinessFormGroupStep1.patchValue({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        ssn: '',
      });

      this.controllerBusinessFormGroupStep2.patchValue({
        address1: '',
        address2: '',
        city: '',
        stateProvinceRegion: '',
        postalCode: '',
        country: 'US'
      });
    }

  }

  changeBeneficialSameAsOfficer() {
    if (this.beneficiarFormGroup.value.isBeneficialSameAsOfficer) {
      this.beneficiarFormGroup.patchValue({
        firstName: this.controllerBusinessFormGroupStep1.value.firstName,
        lastName: this.controllerBusinessFormGroupStep1.value.lastName,
        dateOfBirth: this.controllerBusinessFormGroupStep1.value.dateOfBirth,
//        ssn: this.controllerBusinessFormGroupStep1.value.ssn,

        address1: this.controllerBusinessFormGroupStep2.value.address1,
        address2: this.controllerBusinessFormGroupStep2.value.address2,
        city: this.controllerBusinessFormGroupStep2.value.city,
        stateProvinceRegion: this.controllerBusinessFormGroupStep2.value.stateProvinceRegion,
        postalCode: this.controllerBusinessFormGroupStep2.value.postalCode,
      });

      //      this.beneficiarAddressFormGroup.patchValue({
      //        address1: this.controllerBusinessFormGroupStep2.value.address1,
      //        address2: this.controllerBusinessFormGroupStep2.value.address2,
      //        city: this.controllerBusinessFormGroupStep2.value.city,
      //        stateProvinceRegion: this.controllerBusinessFormGroupStep2.value.state,
      //        postalCode: this.controllerBusinessFormGroupStep2.value.postalCode,
      //      })
    } else {
      this.beneficiarFormGroup.patchValue({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        ssn: '',

        address1: '',
        address2: '',
        city: '',
        stateProvinceRegion: '',
        postalCode: '',
        country: 'US'
      });

      //      this.beneficiarAddressFormGroup.patchValue({
      //        address1: '',
      //        address2: '',
      //        city: '',
      //        stateProvinceRegion: '',
      //        postalCode: '',
      //        country: 'US'
      //      })
    }

  }

  selectedBussinessClassification(ev: any) {
    this.businesFormGroupStep1.patchValue({
      businessClassification: this.arrBusinessClassificationMap[ev.option.value]
    });
  }

  changeAccountType(target: any) {
    switch (target.value) {
      case 'personal':
        this.isPersonalAccount = true;
        this.isBusinessAccount = false;
        this.isRequireBusController = false;
        break;
      case 'business':
        this.isPersonalAccount = false;
        this.isBusinessAccount = true;
        break;
    }
  }

  changeBusinessType(target: any) {
    if (target.value === 'soleProprietorship') {
      this.isRequireBusController = false;
      this.businesFormGroupStep1.controls['dateOfBirth'].enable();
      this.isRequireBeneficiarPassport = false;
    } else {
      this.isRequireBusController = true;
      this.businesFormGroupStep1.controls['dateOfBirth'].disable();
    }
  }

  changeControllerAddressCountry(target: any) {
    this.isRequireControllerPassport = target.value !== 'US';
  }

  changeBeneficiarAddressCountry(target: any) {
    this.isRequireBeneficiarPassport = target.value !== 'US';
  }

  getBusinessClassification() {
    this.http.get<any>(this.host + '/dwl/business-classifications/list')
      .subscribe(
        response => {
          if (response.success) {
            this.arrBusinessClassification = <any> response.data;
          }
        },
        err => {
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  getDateFullFormat(objDate: Date) {
    if (objDate) {
      const intDay = objDate.getDate() > 9 ? objDate.getDate() : '0' + objDate.getDate();
      const intMonth = objDate.getMonth() + 1 > 9 ? objDate.getMonth() + 1 : '0' + (objDate.getMonth() + 1);
      const intFullYear = objDate.getFullYear();

      return intFullYear + '-' + intMonth + '-' + intDay;
    }

    return '';
  }

  getUrlRegisterInDwolla() {
    let url = '/dwl/customer/create';
    if (this.userService.isClient()) {
      url = '/dwl/client/create';
    }

    return url;
  }

  registerPersonalAccount() {
    this.errorService.clearAlerts();
    if (this.stepper.selectedIndex < 3) {
      return;
    }
    this.isLoading = true;

    if (!this.personalFormGroupFirst.valid && !this.personalFormGroupSecond.valid) {
      return;
    }

    const objRequest = Object.assign({}, this.personalFormGroupFirst.value, this.personalFormGroupSecond.value);
    objRequest.u_token = this.userService.getToken();
    objRequest.type = this.businessTypeFormGroup.value.type;
    objRequest.dateOfBirth = this.getDateFullFormat(this.personalFormGroupFirst.value.dateOfBirth);
    objRequest.postalCode = this.personalFormGroupSecond.value.postalCode.toString();
    objRequest.ipAddress = localStorage.getItem('ipClient') || null;

    this.http.post<any>(this.host + this.getUrlRegisterInDwolla(), objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.canShowContinueButton = true;
            this.isLoading = false;
            this.errorService.getMessageSuccess(response);
            this.userService.reInitClient();
          }
        },
        err => {
          this.canShowContinueButton = false;
          this.isLoading = false;
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );

  }

  registerBusinessAccount() {
    this.errorService.clearAlerts();

    if (!this.businesFormGroupStep1.valid && !this.businesFormGroupStep2.valid) {
      return false;
    }

    if (this.isRequireBusController && !this.controllerBusinessFormGroupStep1.valid && !this.controllerBusinessFormGroupStep2.valid) {
      return false;
    }

    if (this.isRequireControllerPassport && !this.controllerPassportBusinessFormGroup.valid) {
      return false;
    }

    if (this.stepper.selectedIndex < 3 && !this.isRequireBusController && !this.isRequireControllerPassport) {
      return;
    }

    if (this.stepper.selectedIndex < 5 && this.isRequireBusController && !this.isRequireControllerPassport) {
      return;
    }


    this.isLoading = true;

    if (this.isRequireBusController) {
      this.showPopupSteper1 = false;
      this.showPopupSteper2 = true;
    }


    //    this.isLoading = false
    //    return

    const objRequest = Object.assign({}, this.businesFormGroupStep1.value, this.businesFormGroupStep2.value);
    objRequest.u_token = this.userService.getToken();
    objRequest.type = this.businessTypeFormGroup.value.type;
    objRequest.postalCode = this.businesFormGroupStep2.value.postalCode.toString();
    objRequest.ein = this.businesFormGroupStep1.value.ein.toString();
    objRequest.ipAddress = localStorage.getItem('ipClient') || null;
    if (this.businesFormGroupStep1.value.dateOfBirth) {
      objRequest.dateOfBirth = this.getDateFullFormat(this.businesFormGroupStep1.value.dateOfBirth);
    }
    if (objRequest.website !== '') {
      objRequest.website = objRequest.dataTransferProtocol + objRequest.website;
    }

    if (this.isRequireBusController) {
      const objController = Object.assign({}, this.controllerBusinessFormGroupStep1.value, this.controllerBusinessFormGroupStep2.value);
      objController.dateOfBirth = this.getDateFullFormat(this.controllerBusinessFormGroupStep1.value.dateOfBirth);

      objController.address = {
        address1: this.controllerBusinessFormGroupStep2.value.address1,
        address2: this.controllerBusinessFormGroupStep2.value.address2,
        city: this.controllerBusinessFormGroupStep2.value.city,
        stateProvinceRegion: this.controllerBusinessFormGroupStep2.value.stateProvinceRegion.toString(),
        postalCode: this.controllerBusinessFormGroupStep2.value.postalCode.toString(),
        country: this.controllerBusinessFormGroupStep2.value.country
      };

      if (this.isRequireControllerPassport) {
        objController.passport = this.controllerPassportBusinessFormGroup.value;
      }
      objRequest.controller = objController;
    }

    this.http.post<any>(this.host + this.getUrlRegisterInDwolla(), objRequest)
      .subscribe(
        response => {
          if (response.success) {
            if (this.isRequireBusController) {
              this.showPopupSteper1 = false;
              this.showPopupSteper2 = true;
            }
            this.errorService.getMessageSuccess(response);
            this.canShowContinueButton = true;
            this.isLoading = false;
            this.userService.reInitClient();
          }
        },
        err => {
          this.canShowContinueButton = false;
          this.isLoading = false;
          this.showPopupSteper1 = true;
          this.showPopupSteper2 = false;
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  registerBeneficialOwner() {
    this.changeStepBeneficiarForm(1);
    this.canShowContinueButton = false;
    this.errorService.clearAlerts    ();
    this.isLoading = true;

    const objRequest = Object.assign({}, this.beneficiarFormGroup.value);
    objRequest.dateOfBirth = this.getDateFullFormat(objRequest.dateOfBirth);
    objRequest.address = Object.assign({}, this.beneficiarFormGroup.value);
    objRequest.address.stateProvinceRegion = objRequest.address.stateProvinceRegion.toString();
    objRequest.address.postalCode = objRequest.address.postalCode.toString();

    if (this.isRequireBeneficiarPassport) {
      //      objRequest.passport = Object.assign({}, this.beneficiarPassportGroup.value)
      objRequest.passport = Object.assign({}, this.beneficiarFormGroup.value);
      objRequest.passport.country = objRequest.passport.passportCountry;
    }
    objRequest.u_token = this.userService.getToken();

    this.http.post<any>(this.host + '/dwl/customer/beneficial-owner/create', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            this.topAlertsService.popToast('success', 'You’re all set',
              'You can start sending and requesting payments from your business account. Have fun!');
            this.isLoading = false;
            this.certifyBeneficialOwner();
            this.onConfirmSetupDwollaAccount();
          }
        },
        err => {
          this.canShowContinueButton = false;
          this.isLoading = false;
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  certifyBeneficialOwner() {
    this.http.post<any>(this.host + '/dwl/customer/beneficial-owner/certify', {u_token: this.userService.getToken()}).subscribe(
      response => { console.log(response); },
      errResponse => { console.log(errResponse); }
    );
  }

  isShowOnLoad() {
    if (this.userService.isMerchant() && !this.userService.isFilledInfoForDwolla()) {
      return true;
    }
    return this.userService.isMerchant() && this.userService.getSubscription()
      && this.userService.isPasswordSet() && !this.userService.isFilledInfoForDwolla();
  }

  onConfirmSetupDwollaAccount() {
    this.changeStep(1);

    if (this.userService.isDwollaRetry()) {
      this.personalFormGroupFirst.get('ssn').clearValidators();
      this.businesFormGroupStep1.get('ssn').clearValidators();
    }
    this.errorService.clearAlerts();
    this.jqueryService.closeModal('.onboarding-in-dwolla-modal');
    this.userService.reInitClient();
    setTimeout(() => {
      if (!this.userService.isHaveBankAccount() && !this.userService.isDwollaSuspended()) {
        this.jqueryService.showModal('.funding-source-setup-modal.modal', {backdrop: 'static', keyboard: false, showClose: true});
      }
    }, 1000);

    this.userService.checkCertifiedBeneficialOwner();
  }
}

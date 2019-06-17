import {Injectable} from '@angular/core'
import {Router, CanActivate, ActivatedRouteSnapshot} from '@angular/router'
import {UserService} from '../_services/user.service'
import {environment} from '../../environments/environment'

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  canActivate( route: ActivatedRouteSnapshot ) {
    if (localStorage.getItem('currentUser') && localStorage.getItem('currentUser') != '{}') {
      this.checkAvailableUrl(route)
      this.checkExpectedRoles(route)
      return true
    }

    // not logged in so redirect to login page
    //this.router.navigate(['/login'])
    this.router.navigateByUrl('/login', { skipLocationChange: false })
    return false
  }
  
  checkAvailableUrl( route: ActivatedRouteSnapshot ) {
    if (route.children[0] ) {
      let bCanActive = true
      switch(route.children[0].routeConfig.path ) {
        case 'send-money':
        case 'send-mass-payouts':
//        console.log( this.userService.getCountFreeChecks() )
          if (this.userService.getCountFreeChecks() > 0 || this.userService.canSendAction() ) {
            bCanActive = true
          } else if ( !this.userService.isHavePlan() ) {
            console.log( 'not have plan' )
            this.redirectNotExpectedRole()
            bCanActive = false
          }
          break
        case 'receive-money':
          if (this.userService.getCountFreeReceivs() > 0 || this.userService.canRequestAction() ) {
            bCanActive = true
          } else if ( !this.userService.isHavePlan() ) {
            this.redirectNotExpectedRole()
            bCanActive = false
          }
          break
        case 'payment-page':
          bCanActive = false
          if (this.userService.isPaymentLinkEnabled() ) { // this.userService.getCountFreeReceivs() > 0
            bCanActive = true
          } else if ( !this.userService.isHavePlan() || !bCanActive ) {
            this.redirectNotExpectedRole()
            bCanActive = false
          }
          break
      }
      
      return bCanActive
    }
  }
  
  checkExpectedRoles( route: ActivatedRouteSnapshot ) {
    if( route.children[0] && route.children[0].data && route.children[0].data.expectedRoles && route.children[0].data.expectedRoles.length ) {
      let expectedRoles = route.children[0].data.expectedRoles
      let bExpectedRole = false
      let strRole = this.userService.getUserRole()

      expectedRoles.forEach(function (item: string) {
        if (item === strRole) {
          bExpectedRole = true
        }
      })
      
      if( bExpectedRole ) {
        return bExpectedRole
      } else {
        this.redirectNotExpectedRole()
        return false
      }
      
      
//      if(expectedRoles.includes(this.userService.getUserRole()) ) {
//        return true
//      } else {
//        this.redirectNotExpectedRole()
//        return false
//      }
    }
  }
  
  redirectNotExpectedRole() {
    if (this.userService.isAdmin() || this.userService.isSuperAdmin() ) {
      this.router.navigateByUrl('/users', { skipLocationChange: false })
    }
    
    if (this.userService.isMerchant() || this.userService.isCustomer() ) {
      this.router.navigateByUrl('/transactions', { skipLocationChange: false })
    }
  }
}
import {Injectable} from '@angular/core';

declare var $: any;
declare var Plaid: any;

@Injectable({
  providedIn: 'root'
})
export class JqueryService {

  public PlaidInstance: any = {};
  public isInitMenu = false;

  constructor() {
    this.initInterface();
    setTimeout(() => this.getClientIp(), 2000);
  }

  os_init_mobile_menu() {
    // INIT MOBILE MENU TRIGGER BUTTON
    $('.mobile-menu-trigger').unbind( 'click' ).on('click', function () {
      $('.menu-mobile .menu-and-user').slideToggle(200, 'swing');
      return false;
    });
  }

  os_init_mobile_link() {
    if (!this.isInitMenu) {
      this.isInitMenu = true;
      setTimeout(function () {
        $('.menu-mobile a.mobile-item').unbind( 'click' ).click(function () {
          $('.menu-mobile .menu-and-user').slideToggle(500, 'swing');
        });
      }, 1000);
    }
  }

  os_init_sub_menus() {

    // INIT MENU TO ACTIVATE ON HOVER
    let menu_timer;
    $('.menu-activated-on-hover').on('mouseenter', 'ul.main-menu > li.has-sub-menu', function () {
      const $elem = $(this);
      clearTimeout(menu_timer);
      $elem.closest('ul').addClass('has-active').find('> li').removeClass('active');
      $elem.addClass('active');
    });

    $('.menu-activated-on-hover').on('mouseleave', 'ul.main-menu > li.has-sub-menu', function () {
      const $elem = $(this);
      menu_timer = setTimeout(function () {
        $elem.removeClass('active').closest('ul').removeClass('has-active');
      }, 30);
    });

    // INIT MENU TO ACTIVATE ON CLICK
    $('.menu-activated-on-click').on('click', 'li.has-sub-menu > a', function (event) {
      const $elem = $(this).closest('li');
      if ($elem.hasClass('active')) {
        $elem.removeClass('active');
      } else {
        $elem.closest('ul').find('li.active').removeClass('active');
        $elem.addClass('active');
      }
      return false;
    });
  }

  initLeftSideBarActions() {
    // console.log( $('.menuItemUsers') )
    $('.menuItemUsers').click( function () {
      console.log('fdsfdasfasd');
      localStorage.removeItem('usersList');
    });
  }

  initInterface() {
    // INIT MENU
    this.os_init_sub_menus();

    // #16. OUR OWN CUSTOM DROPDOWNS
    setTimeout(function () {
      $('.os-dropdown-trigger').on('mouseenter', function () {
        $(this).addClass('over');
      });
      $('.os-dropdown-trigger').on('mouseleave', function () {
        $(this).removeClass('over');
      });
    }, 1000);
    this.os_init_mobile_menu();
    this.os_init_mobile_link();


    // #22. Colors Toggler
//    let vm = this
//    $('.floated-colors-btn').on('click', function () {
//      vm.applyColorTheme()
//    });

    setTimeout(function () {
      $('.floated-customizer-btn, .button-filters').unbind( 'click' ).on('click', function () {
        return $('.floated-customizer-panel').toggleClass('active');
      });
      $('.close-customizer-btn').unbind( 'click' ).on('click', function () {
        $('.floated-customizer-panel').removeClass('active');
      });

      $(document).mouseup(function (e) {
        const block = $('.floated-customizer-panel');
        if (!block.is(e.target)
          && block.has(e.target).length === 0) {
          block.removeClass('active');
        }
      });
    }, 1000);

    setTimeout(function () {
      $('.alert-relogin-modal.show-relogin').modal({backdrop: 'static', keyboard: false});

      $('.onboarding-modal.show-on-load').modal({backdrop: 'static', keyboard: false});
    }, 1000);
    setTimeout(function () {
      $('.onboarding-sandbox-modal.show-on-load').modal({backdrop: 'static', keyboard: false, showClose: true});
    }, 1000);
    setTimeout(function () {
      $('.funding-source-setup-modal.show-on-load').modal({backdrop: 'static', keyboard: false, showClose: true});
    }, 1000);
    setTimeout(function () {
      $('.password-setup-modal.show-on-load').modal({backdrop: 'static', keyboard: false, showClose: true});
    }, 1000);
  }

  showModal(strSelector: string, options: any) {
    if (options) {
      $(strSelector).modal(options);
    } else {
      $(strSelector).modal('show');
    }
  }

  showPurchasePlanModal() {
    $('.onboarding-purchase-plan-modal').modal({backdrop: 'static', keyboard: false, showClose: true});
    $('#initListViewOurPlans').click();
  }

  closeModal(strSelector: string) {
    $(strSelector).modal('hide');
  }

  removeSelector(selector: string) {
    $(selector).remove();
  }

  showTabBySelector(selector: string) {
    $(selector).tab('show');
  }

  addClass(selector: string, className: string) {
    $(selector).addClass(className);
  }
  removeClass(selector: string, className: string) {
    $(selector).removeClass(className);
  }

  initPlaid(objConfig: any) {
    return this.PlaidInstance = new Plaid.create(objConfig);
  }

  onClick(selector: string = '') {
    $(selector).click();
  }

  openPlaidWindow() {
    this.PlaidInstance.open();
  }

  setFocus(selector: string) {
    $(selector).focus();
  }
  resetFocus(selector: string) {
    $(selector).blur();
  }

  emulateKeyPress(selector: string) {
    $(selector).keypress();
  }

  setContent(selector: string, content: string = '') {
    $(selector).html(content);
  }

  resetFile(selector: string) {
    const input = $(selector);
    input.replaceWith(input.val('').clone(true));
  }



  setValue(selector: string, value: string = '') {
    $(selector).val(value);
  }

  resetForm(selector: string) {
    $(selector)[0].reset();
  }

  toggleWraper(selector: string) {
    $(selector).toggle('slow');
  }

  getBase64UrlFromCanvas(selector: string) {
    const canvas: any = document.getElementsByTagName(selector).item(0);
    if (canvas) {
      return canvas.toDataURL();
    }
  }

  clearCanvas(selector: string) {
    const canvas: any = document.getElementsByTagName(selector).item(0);
    if (canvas) {
      canvas.width = canvas.width;
    }
  }

  haveItemInLocalStorage(itemName: string) {
    return localStorage.getItem(itemName) ? true : false;
  }

  getClientIp() {
    if (localStorage.getItem('ipClient')) {
      return;
    }
    $.getJSON('https://jsonip.com?callback=?', function (data) {
      if (data.ip) {
        localStorage.setItem('ipClient', data.ip);
      } else {
        localStorage.removeItem('ipClient');
      }
    });
  }

  getDomElement( selector: string ) {
    return $(selector);
  }
}

(function($){
var $ = jQuery = $;

window.slate = window.slate || {};
window.theme = window.theme || {};

/*============== Translations ===============*/
theme.strings = $.extend(theme.strings, {
  addressError: "translation missing: it.map.errors.address_error",
  addressNoResults: "translation missing: it.map.errors.address_no_results",
  addressQueryLimit: "translation missing: it.map.errors.address_query_limit_html",
  authError: "translation missing: it.map.errors.auth_error_html",
  addingToCart: "...",
  addedToCart: "Fatto 😋",
  cart: "Carrello",
  cartTermsNotChecked: "Devi accettare i termini e condizioni prima di poter continuare.",
  searchLoading: "Sto cercando nello shop.. 🧐",
  searchNoResults: "Nessun risultato",
  priceFrom: "Da",
  quantityTooHigh: "Puoi solo avere {{ quantity }} nel carrello",
  onSale: "Scontato",
  soldOut: "Sold out 😞"
});

/*================ Slate ================*/
/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {

  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element.first()
      .attr('tabIndex', '-1')
      .focus()
      .addClass(focusClass)
      .one('blur', callback);

    function callback() {
      $element.first()
        .removeClass(focusClass)
        .removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on('click', function(evt) {
      this.pageLinkFocus($(evt.currentTarget.hash));
    }.bind(this));
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).on(eventName, function(evt) {
      if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/**
 * Cart Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Cart template.
 *
 * @namespace cart
 */

slate.cart = {
  
  /**
   * Browser cookies are required to use the cart. This function checks if
   * cookies are enabled in the browser.
   */
  cookiesEnabled: function() {
    var cookieEnabled = navigator.cookieEnabled;

    if (!cookieEnabled){
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
    }
    return cookieEnabled;
  }
};

/**
 * Utility helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions for dealing with arrays and objects
 *
 * @namespace utils
 */

slate.utils = {

  /**
   * Return an object from an array of objects that matches the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  findInstance: function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return array[i];
      }
    }
  },

  /**
   * Remove an object from an array of objects by matching the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  removeInstance: function(array, key, value) {
    var i = array.length;
    while(i--) {
      if (array[i][key] === value) {
        array.splice(i, 1);
        break;
      }
    }

    return array;
  },

  /**
   * _.compact from lodash
   * Remove empty/false items from array
   * Source: https://github.com/lodash/lodash/blob/master/compact.js
   *
   * @param {array} array
   */
  compact: function(array) {
    var index = -1;
    var length = array == null ? 0 : array.length;
    var resIndex = 0;
    var result = [];

    while (++index < length) {
      var value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  },

  /**
   * _.defaultTo from lodash
   * Checks `value` to determine whether a default value should be returned in
   * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
   * or `undefined`.
   * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
   *
   * @param {*} value - Value to check
   * @param {*} defaultValue - Default value
   * @returns {*} - Returns the resolved value
   */
  defaultTo: function(value, defaultValue) {
    return (value == null || value !== value) ? defaultValue : value
  }
};

/**
 * Rich Text Editor
 * -----------------------------------------------------------------------------
 * Wrap iframes and tables in div tags to force responsive/scrollable layout.
 *
 * @namespace rte
 */

slate.rte = {
  /**
   * Wrap tables in a container div to make them scrollable when needed
   *
   * @param {object} options - Options to be used
   * @param {jquery} options.$tables - jquery object(s) of the table(s) to wrap
   * @param {string} options.tableWrapperClass - table wrapper class name
   */
  wrapTable: function(options) {
    var tableWrapperClass = typeof options.tableWrapperClass === "undefined" ? '' : options.tableWrapperClass;

    options.$tables.wrap('<div class="' + tableWrapperClass + '"></div>');
  },

  /**
   * Wrap iframes in a container div to make them responsive
   *
   * @param {object} options - Options to be used
   * @param {jquery} options.$iframes - jquery object(s) of the iframe(s) to wrap
   * @param {string} options.iframeWrapperClass - class name used on the wrapping div
   */
  wrapIframe: function(options) {
    var iframeWrapperClass = typeof options.iframeWrapperClass === "undefined" ? '' : options.iframeWrapperClass;

    options.$iframes.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="' + iframeWrapperClass + '"></div>');
      
      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

slate.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:section:reorder', this._onReorder.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

slate.Sections.prototype = $.extend({}, slate.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (typeof constructor === 'undefined') {
      return;
    }

    var instance = $.extend(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (!instance) {
      return;
    }

    if (typeof instance.onUnload === 'function') {
      instance.onUnload(evt);
    }

    this.instances = slate.utils.removeInstance(this.instances, 'id', evt.detail.sectionId);
  },

  _onSelect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onSelect === 'function') {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onDeselect === 'function') {
      instance.onDeselect(evt);
    }
  },

  _onReorder: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onReorder === 'function') {
      instance.onReorder(evt);
    }
  },

  _onBlockSelect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onBlockSelect === 'function') {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onBlockDeselect === 'function') {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(function(index, container) {
      this._createInstance(container, constructor);
    }.bind(this));
  }
});

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 */

slate.Currency = (function() {
  var moneyFormat = '$';

  /**
   * Format money values based on your shop currency settings
   * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
   * or 3.00 dollars
   * @param  {String} format - shop money_format setting
   * @return {String} value - formatted value
   */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = slate.utils.defaultTo(precision, 2);
      thousands = slate.utils.defaultTo(thousands, ',');
      decimal = slate.utils.defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', '.');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  };
})();

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

slate.Image = (function() {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

    if (match) {
      return match[1];
    } else {
      return null;
    }
  }

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    } else {
      return null;
    }
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist. Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
  }

  Variants.prototype = $.extend({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = $.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = slate.utils.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;
      var found = false;

      variants.forEach(function(variant) {
        var satisfied = true;

        selectedValues.forEach(function(option) {
          if (satisfied) {
            satisfied = (option.value === variant[option.index]);
          }
        });

        if (satisfied) {
          found = variant;
        }
      });

      return found || null;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
        return;
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param {object} variant - Currently selected variant
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param {object} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container)[0].value = variant.id;
    }
  });

  return Variants;
})();


/*=============== Components ===============*/
// Loading third party scripts, with callbacks
theme.scriptsLoaded = {};
theme.loadScriptOnce = function(src, callback, beforeRun) {
  if(typeof theme.scriptsLoaded[src] === 'undefined') {
    theme.scriptsLoaded[src] = [];
    var tag = document.createElement('script');
    tag.src = src;

    if(beforeRun) {
      tag.async = false;
      beforeRun();
    }

    if(typeof callback === 'function') {
      theme.scriptsLoaded[src].push(callback);
      if (tag.readyState) { // IE, incl. IE9
        tag.onreadystatechange = (function() {
          if (tag.readyState == "loaded" || tag.readyState == "complete") {
            tag.onreadystatechange = null;
            for(var i = 0; i < theme.scriptsLoaded[this].length; i++) {
              theme.scriptsLoaded[this][i]();
            }
            theme.scriptsLoaded[this] = true;
          }
        }).bind(src);
      } else {
        tag.onload = (function() { // Other browsers
          for(var i = 0; i < theme.scriptsLoaded[this].length; i++) {
            theme.scriptsLoaded[this][i]();
          }
          theme.scriptsLoaded[this] = true;
        }).bind(src);
      }
    }

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    return true;
  } else if(typeof theme.scriptsLoaded[src] === 'object' && typeof callback === 'function') {
    theme.scriptsLoaded[src].push(callback);
  } else {
    if(typeof callback === 'function') {
      callback();
    }
    return false;
  }
}

theme.storageAvailable = function(type) {
  try {
      var storage = window[type],
          x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
  }
  catch(e) {
      return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
          storage.length !== 0;
  }
};

theme.variants = {
  selectors: {
    originalSelectorId: '[data-product-select]',
    priceWrapper: '[data-price-wrapper]',
    productPrice: '[data-product-price]',
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    comparePrice: '[data-compare-price]',
    comparePriceText: '[data-compare-text]'
  },

  /**
   * Updates the DOM state of the add to cart button
   */
  updateAddToCartState: function(evt){
    var variant = evt.variant;

    if (variant) {
      $(theme.variants.selectors.priceWrapper, this.$container).removeClass('hide');
    } else {
      $(theme.variants.selectors.addToCart, this.$container).prop('disabled', true);
      $(theme.variants.selectors.addToCartText, this.$container).html(theme.strings.unavailable);
      $(theme.variants.selectors.priceWrapper, this.$container).addClass('hide');
      return;
    }

    if (variant.available) {
      $(theme.variants.selectors.addToCart, this.$container).prop('disabled', false);
      $(theme.variants.selectors.addToCartText, this.$container).html(theme.strings.addToCart);
      $('form', this.$container).removeClass('variant--unavailable');
    } else {
      $(theme.variants.selectors.addToCart, this.$container).prop('disabled', true);
      $(theme.variants.selectors.addToCartText, this.$container).html(theme.strings.soldOut);
      $('form', this.$container).addClass('variant--unavailable');
    }

    // backorder
    var $backorderContainer = $('.backorder', this.$container);
    if($backorderContainer.length) {
      if(variant && variant.available) {
        var $option = $(theme.variants.selectors.originalSelectorId + ' option[value="' + variant.id + '"]', this.$container);
        if(variant.inventory_management && $option.data('stock') == 'out') {
          $backorderContainer.find('.backorder__variant').html(this.productSingleObject.title + (variant.title.indexOf('Default') >= 0 ? '' : ' - '+variant.title) );
          $backorderContainer.show();
        } else {
          $backorderContainer.hide();
        }
      } else {
        $backorderContainer.hide();
      }
    }
  },

  /**
   * Updates the DOM with specified prices
   */
  updateProductPrices: function(evt){
    var variant = evt.variant;
    var $comparePrice = $(theme.variants.selectors.comparePrice, this.$container);
    var $compareEls = $comparePrice.add(theme.variants.selectors.comparePriceText, this.$container);

    $(theme.variants.selectors.productPrice, this.$container)
      .html('<span class="theme-money">' + slate.Currency.formatMoney(variant.price, theme.moneyFormat) + '</span>');

    if (variant.compare_at_price > variant.price) {
      $(theme.variants.selectors.productPrice, this.$container).addClass('product-price__reduced');
      $comparePrice.html('<span class="theme-money">' + slate.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat) + '</span>');
      $compareEls.removeClass('hide');
    } else {
      $(theme.variants.selectors.productPrice, this.$container).removeClass('product-price__reduced');
      $comparePrice.html('');
      $compareEls.addClass('hide');
    }
    theme.checkCurrency();
  }
};

$(document).ready(function() {
  $('.atcmobile:hidden').remove();
  $('.atcdesktop:hidden').remove();
  
  // [Fix] double addToCart Facebook Event
  // Old Code: $(document).on('submit', 'form[action^="/cart/add"]:not(.no-ajax)', function(e) {
  $('form[action^="/cart/add"]:not(.no-ajax)').on('submit', function(e) {
    var $form = $(this);
    //Disable add button
    $form.find(':submit').attr('disabled', 'disabled').each(function(){
      var contentFunc = $(this).is('button') ? 'html' : 'val';
      $(this).data('previous-value', $(this)[contentFunc]())[contentFunc](theme.strings.addingToCart);
    });

    
    
    //Add to cart
    $.post('/cart/add.js', $form.serialize(), function(itemData) {

      //Enable add button
      var $btn = $form.find(':submit').each(function(){
        var $btn = $(this);
        var contentFunc = $(this).is('button') ? 'html' : 'val';
        //Set to 'DONE', alter button style, wait a few secs, revert to normal
        $btn[contentFunc](theme.strings.addedToCart);
        setTimeout(function() {
          ajaxCart.load();
        }, 500)
        setTimeout(function(){
          $btn.removeAttr('disabled')[contentFunc]($btn.data('previous-value'));
        }, 2000);
      }).first();


      // reload header
      $.get('/search', function(data){
        var selectors = [
          '.page-header .header-cart',
          '.docked-navigation-container .header-cart'
        ];
        var $parsed = $($.parseHTML('<div>' + data + '</div>'));
        for(var i=0; i<selectors.length; i++) {
          var cartSummarySelector = selectors[i];
          var $newCartObj = $parsed.find(cartSummarySelector).clone();
          var $currCart = $(cartSummarySelector);
          $currCart.replaceWith($newCartObj);
        }
        theme.checkCurrency();
      });

      // close quick-buy, if present
      $.colorbox.close();

      // display added notice
      // get full product data
      theme.productData = theme.productData || {};
      if(!theme.productData[itemData.product_id]) {
        theme.productData[itemData.product_id] = JSON.parse(document.querySelector('.ProductJson-' + itemData.product_id).innerHTML);
      }
      var productVariant = null;
      var productPrice = '';
      for(var i=0; i<theme.productData[itemData.product_id].variants.length; i++) {
        var variant = theme.productData[itemData.product_id].variants[i];
        if(variant.id == itemData.variant_id) {
          productVariant = variant;
          if(variant.compare_at_price && variant.compare_at_price > variant.price) {
            productPrice += [
              '<span class="cart-summary__price-reduced product-price__reduced theme-money">',
              slate.Currency.formatMoney(itemData.price, theme.moneyFormat),
              '</span>',
              '<span class="cart-summary__price-compare product-price__compare theme-money">',
              slate.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat),
              '</span> '
            ].join('');
          } else {
            productPrice += '<span class="theme-money">' + slate.Currency.formatMoney(itemData.price, theme.moneyFormat) + '</span>';
          }
        }
      }

      // append quantity
      var $qty = $form.find('[name="quantity"]');
      if($qty.length && $qty.val().length & $qty.val() > 1) {
        productPrice += ' <span class="cart-summary__quantity">' + $qty.val() + '</span>';
      }

      var productVariantsHTML = '';
      if(productVariant) {
        // get option names from full product data
        var optionNames = theme.productData[itemData.product_id].options;
        productVariantsHTML = '<div class="cart-summary__product__variants">';
        for(var i=0; i<productVariant.options.length; i++) {
          if(productVariant.options[i].indexOf('Default Title') < 0) {
            productVariantsHTML += '<div class="cart-summary__variant">';
            productVariantsHTML += '<span class="cart-summary__variant-label">' + optionNames[i] + ':</span> ';
            productVariantsHTML += '<span class="cart-summary__variant-value">' + productVariant.options[i] + '</span>';
            productVariantsHTML += '</div>';
          }
        }
        productVariantsHTML += '</div>';
      }

      var productImage;
      if(productVariant.featured_image) {
        productImage = slate.Image.getSizedImageUrl(productVariant.featured_image.src, '200x');
      } else {
        productImage = slate.Image.getSizedImageUrl(theme.productData[itemData.product_id].featured_image, '200x');
      }
      var $template = $([
        '<div class="added-notice global-border-radius added-notice--pre-reveal">',
        '<div class="added-notice__header">',
        '<a href="/cart">', theme.strings.cart , '</a>',
        '<a class="added-notice__close feather-icon" href="#">', theme.icons.close , '</a>',
        '</div>',
        '<div class="cart-summary global-border-radius">',
        '<div class="cart-summary__product">',
        '<div class="cart-summary__product-image"><img class="global-border-radius" src="', productImage, '"></div>',
        '<div class="cart-summary__product__description">',
        '<div class="cart-summary__product-title">', theme.productData[itemData.product_id].title, '</div>',
        '<div class="cart-summary__price">', productPrice, '</div>',
        productVariantsHTML,
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join(''));
      $template.appendTo('body');
      theme.checkCurrency();

      // transition in
      setTimeout(function(){
        $template.removeClass('added-notice--pre-reveal');
      }, 10);

      // transition out
      theme.addedToCartNoticeHideTimeoutId = setTimeout(function(){
        $template.find('.added-notice__close').trigger('click');
      }, 5000);

    }, 'json').error(function(data) {
      //Enable add button
      var $firstBtn = $form.find(':submit').removeAttr('disabled').each(function(){
        var $btn = $(this);
        var contentFunc = $btn.is('button') ? 'html' : 'val';
        $btn[contentFunc]($btn.data('previous-value'))
      }).first();

      //Not added, show message
      if(typeof(data) != 'undefined' && data.responseJSON && data.responseJSON.description) {
        theme.showQuickPopup(data.responseJSON.description, $firstBtn);
      } else {
        //Some unknown error? Disable ajax and submit the old-fashioned way.
        $form.addClass('no-ajax');
        $form.submit();
      }
    });
    return false;
  });

  $(document).on('click', '.added-notice__close', function(){
    var $template = $(this).closest('.added-notice').addClass('added-notice--pre-destroy');
    setTimeout(function(){
      $template.remove();
    }, 500);
    return false;
  });

  $(document).on('mouseenter', '.header-cart', function(){
    clearTimeout(theme.addedToCartNoticeHideTimeoutId);
    $('.added-notice__close').trigger('click');
  });
});

// overlap avoidance
$(document).ready(function() {
  var overlapGutter = 10;
  var overlapGutterFuzzed = overlapGutter + 1;
  var GRAVITY_LEFT = 0,
      GRAVITY_CENTRE = 1,
      GRAVITY_RIGHT = 2;

  function oaElementToOriginalRectangle($el) {
    var t = {
      left: $el.offset().left - parseFloat($el.css('margin-left')),
      top: $el.offset().top - parseFloat($el.css('margin-top')),
      width: $el.outerWidth(),
      height: $el.outerHeight()
    };
    t.right = t.left + t.width;
    t.bottom = t.top + t.height;
    if($el.hasClass('avoid-overlaps__item--gravity-left')) {
      t.gravity = GRAVITY_LEFT;
    } else if($el.hasClass('avoid-overlaps__item--gravity-right')) {
      t.gravity = GRAVITY_RIGHT;
    } else {
      t.gravity = GRAVITY_CENTRE;
    }
    return t;
  }

  function oaSetOffsetFromCentre(item) {
    if(item.newRect.gravity == GRAVITY_LEFT) {
      // top left position already set by default
    } else if(item.newRect.gravity == GRAVITY_RIGHT) {
      item.newRect.right = item.newRect.left;
      item.newRect.left = item.newRect.right - item.newRect.width;
    } else {
      item.newRect.left = item.newRect.left - item.newRect.width / 2;
      item.newRect.right = item.newRect.left + item.newRect.width;
    }
    item.newRect.top = item.newRect.top - item.newRect.height / 2;
    item.newRect.bottom = item.newRect.top + item.newRect.height;
  }

  function oaRectIsInsideBoundary(rect, container) {
    return rect.left >= container.left + overlapGutter
      && rect.top >= container.top + overlapGutter
      && rect.right <= container.right - overlapGutter
      && rect.bottom <= container.bottom - overlapGutter;
  }

  function oaEnforceBoundaryConstraint(item, containerRect) {
    // left
    if(item.newRect.left < containerRect.left + overlapGutter) {
      item.newRect.left = containerRect.left + overlapGutterFuzzed;
      item.newRect.right = item.newRect.left + item.newRect.width;
    }
    // top
    if(item.newRect.top < containerRect.top + overlapGutter) {
      item.newRect.top = containerRect.top + overlapGutterFuzzed;
      item.newRect.bottom = item.newRect.top + item.newRect.height;
    }
    // right
    if(item.newRect.right > containerRect.right - overlapGutter) {
      item.newRect.right = containerRect.right - overlapGutterFuzzed;
      item.newRect.left = item.newRect.right - item.newRect.width;
    }
    // bottom
    if(item.newRect.bottom > containerRect.bottom - overlapGutter) {
      item.newRect.bottom = containerRect.bottom - overlapGutterFuzzed;
      item.newRect.top = item.newRect.bottom - item.newRect.height;
    }
  }

  function oaRectanglesOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom);
  }

  function oaRectanglesOverlapWithGutter(rect1, rect2) {
    // increase rect1 size to fake gutter check
    return !((rect1.right + overlapGutter) < rect2.left ||
      (rect1.left - overlapGutter) > rect2.right ||
      (rect1.bottom + overlapGutter) < rect2.top ||
      (rect1.top - overlapGutter) > rect2.bottom);
  }

  function oaGetSortedVectorsToAttempt(rect1, rect2) {
    // 0 - top, 1 - right, 2 - bottom, 3 - left
    // compare mid-points
    var deltaX = (rect2.left + (rect2.right-rect2.left)/2) - (rect1.left + (rect1.right-rect1.left)/2);
    var deltaY = (rect2.top + (rect2.bottom-rect2.top)/2) - (rect1.top + (rect1.bottom-rect1.top)/2);
    if(Math.abs(deltaX) > Math.abs(deltaY)) {
      if(deltaX > 0) {
        return [1,0,2,3];
      } else {
        return [3,0,2,1];
      }
    } else {
      if(deltaY > 0) {
        return [2,1,3,0];
      } else {
        return [0,1,3,2];
      }
    }
  }

  function oaAttemptReposition(toMove, vector, movingAwayFrom, containerRect, allItems) {
    var newRect = $.extend({}, toMove.newRect);
    switch(vector) {
      case 0: // up
        newRect.bottom = movingAwayFrom.newRect.top - overlapGutterFuzzed;
        newRect.top = newRect.bottom - newRect.height;
        break;
      case 1: // right
        newRect.left = movingAwayFrom.newRect.right + overlapGutterFuzzed;
        newRect.right = newRect.left + newRect.width;
        break;
      case 2: // down
        newRect.top = movingAwayFrom.newRect.bottom + overlapGutterFuzzed;
        newRect.bottom = newRect.top + newRect.height;
        break;
      case 3: // left
        newRect.right = movingAwayFrom.newRect.left - overlapGutterFuzzed;
        newRect.left = newRect.right - newRect.width;
        break;
    }

    // check if new position is inside container
    var isInsideBoundary = oaRectIsInsideBoundary(newRect, containerRect);

    // check if new position overlaps any other elements
    var doesOverlap = false;
    for(var i=0; i<allItems.length; i++) {
      var item = allItems[i];
      if(item.el[0] != toMove.el[0]) { // skip self
        if(oaRectanglesOverlap(newRect, item.newRect)) {
          doesOverlap = true;
        }
      }
    }

    // assign new position if deemed valid
    if(isInsideBoundary && !doesOverlap) {
      toMove.newRect = newRect;
      return true;
    }
    return false;
  }

  var checkOverlaps = function(){
    // every overlap-avoidance zone
    $('.avoid-overlaps').each(function(){
      var $container = $(this),
          $mobileContainer = $('.avoid-overlaps__mobile-container', this),
          containerRect = null;
      if($mobileContainer.length && $mobileContainer.css('position') == 'relative') {
        containerRect = oaElementToOriginalRectangle($mobileContainer);
      } else {
        containerRect = oaElementToOriginalRectangle($container);
      }

      // all items that could overlap, in this zone
      var $candidates = $(this).find('.avoid-overlaps__item');

      // create cached dimensions to work on
      var itemsToProcess = []; // all elements that can collide
      var itemsThatCanBeMoved = []; // e.g. labels, positioned overlay title
      var itemsThatCanBeMoveALot = []; // e.g. labels
      $candidates.each(function(){
        var item = {
          el: $(this),
          newRect: oaElementToOriginalRectangle($(this)),
          oldRect: oaElementToOriginalRectangle($(this)),
          overlaps: false
        };
        // all items
        itemsToProcess.push(item);
        // items that can be moved freely
        if(!$(this).hasClass('overlay')) {
          itemsThatCanBeMoveALot.push(item);
        }
        // any items that can be moved
        if(
          $(this).css('position') == 'absolute'
          && !$(this).hasClass('overlay--bottom-wide')
          && !$(this).hasClass('overlay--low-wide')
        ) {
          itemsThatCanBeMoved.push(item);
        }
      });

      // for each moveable element
      for(var i=0; i<itemsThatCanBeMoved.length; i++) {
        var candidate = itemsThatCanBeMoved[i];
        // ensure it is positioned relative to centre
        oaSetOffsetFromCentre(candidate);

        // move inside container boundary
        oaEnforceBoundaryConstraint(candidate, containerRect);
      }

      // for every element, check if any freely moveable elements overlap it - and move if so
      for(var i=0; i<itemsToProcess.length; i++) {
        var candidate = itemsToProcess[i];
        for(var j=0; j<itemsThatCanBeMoveALot.length; j++) {
          var checking = itemsThatCanBeMoveALot[j];
          if(checking.el[0] != candidate.el[0]) { // skip self
            var vectorPreference = oaGetSortedVectorsToAttempt(candidate.newRect, checking.newRect);
            while(vectorPreference.length > 0 && oaRectanglesOverlapWithGutter(candidate.newRect, checking.newRect)) {
              var moved = oaAttemptReposition(checking, vectorPreference.shift(), candidate, containerRect, itemsToProcess);
              checking.overlaps = !moved;
            }
          }
        }
      }

      // set the new positions
      for(var j=0; j<itemsToProcess.length; j++) {
        var item = itemsToProcess[j];
        var deltaX = item.newRect.left - item.oldRect.left;
        var deltaY = item.newRect.top - item.oldRect.top;
        item.el.css({
          marginLeft: deltaX != 0 ? deltaX : '',
          marginTop: deltaY != 0 ? deltaY : ''
        });
        item.el.toggleClass('is-overlapping', item.overlaps);
      }
    }).addClass('avoid-overlaps--processed');
  }

  $(window).on('load debouncedresize', checkOverlaps);
  $(document).on('shopify:section:load', function(){
    setTimeout(checkOverlaps, 10);
  });
});

theme.assessLoadedRTEImage = function(el) {
  // container width
  var rteWidth = $(el).closest('.rte').width();
  // check original width
  if($(el)[0].naturalWidth > rteWidth) {
    // wider
    var para = $(el).parentsUntil('.rte').filter('p');
    if(para.length > 0) {
      para.addClass('expanded-width'); // inside a para already
    } else {
      $(el).wrap('<p class="expanded-width"></p>'); // put it inside a para
    }
  } else {
    // not wider
    $(el).closest('.expanded-width').removeClass('expanded-width');
  }
};

// on image load
theme.assessRTEImagesOnLoad = function(container){
  $('.rte--expanded-images img:not(.exp-loaded)', container).each(function(){
    var originalImage = this;
    var img = new Image();
    $(img).on('load.rteExpandedImage', function(){
      $(originalImage).addClass('exp-loaded');
      theme.assessLoadedRTEImage(originalImage);
    });
    img.src = this.src;
    if(img.complete || img.readyState === 4) {
      // image is cached
      $(img).off('load.rteExpandedImage');
      $(originalImage).addClass('exp-loaded');
      theme.assessLoadedRTEImage(originalImage);
    }
  });
};

// initialise all images
theme.assessRTEImagesOnLoad();

// check any loaded images again on viewport resize
$(window).on('debouncedresize', function(){
  $('.rte--expanded-images img.exp-loaded').each(function(){
    theme.assessLoadedRTEImage(this);
  });
});

theme.recentProductCacheExpiry = 1000*60 * 10; // 10 mins
theme.recentProductHistoryCap = 12;

// recentArr must be the full array of all recent products, as it is used to update the cache
theme.addRecentProduct = function(recentArr, index, $container, showHover) {
  var item = recentArr[index],
      _recentArr = recentArr,
      _showHover = showHover,
      $itemContainer = $('<div class="product-block grid__item one-sixth medium--one-quarter small-down--one-whole">');

  // check timestamp age
  var currentTimestamp = new Date().getTime();
  if(item.timestamp && item.timestamp > currentTimestamp - theme.recentProductCacheExpiry) {
    // display now
    $itemContainer.append(theme.buildRecentProduct(item, _showHover));
  } else {
    // get fresh data
    $.get('/products/' + item.handle + '.json', function(data){
      // update array with new data
      item.title = data.product.title;
      item.imageUrl = data.product.images[0].src;
      item.timestamp = currentTimestamp;
      // save updated recent products list
      window.localStorage.setItem('theme.recent_products', JSON.stringify(_recentArr));
      // display
      $itemContainer.append(theme.buildRecentProduct(item, _showHover));
    });
  }
  $container.append($itemContainer);
  theme.assessRecentProductGrid($container);
};

theme.assessRecentProductGrid = function($container){
  // add classes to hide all but 4 on tablet
  var $items = $container.children();
  var toHideOnTablet = Math.max($items.length - 4, 0);
  if(toHideOnTablet > 0) {
    $items.slice(0, 3).removeClass('medium--hide');
    for(var i = 0; i < toHideOnTablet; i++) {
      $($items[i]).addClass('medium--hide');
    }
  }
};

theme.buildRecentProduct = function(item, showHover) {
  var $item = $('<a class="recently-viewed-product plain-link">').attr({
    href: '/products/' + item.handle,
    title: item.title
  });
  var $title = $('<div class="product-title small-text">').html(item.title);
  var $priceCont = $('<div class="product-price small-text">');
  if(item.priceVaries) {
    $('<span class="product-price__from tiny-text">').html(theme.strings.priceFrom).appendTo($priceCont);
    $priceCont.append(' ');
  }
  if(item.priceCompare > item.price) {
    $('<span class="product-price__reduced theme-money">').html(slate.Currency.formatMoney(item.price, theme.moneyFormat)).appendTo($priceCont);
    $priceCont.append(' ');
    $('<span class="product-price__compare theme-money">').html(slate.Currency.formatMoney(item.priceCompare, theme.moneyFormat)).appendTo($priceCont);
  } else {
    $('<span class="theme-money">').html(slate.Currency.formatMoney(item.price, theme.moneyFormat)).appendTo($priceCont);
  }

  var $imageCont = $('<div class="hover-images global-border-radius relative">').appendTo($item);
  $('<div class="image-one">').append($('<img>').attr('src', item.imageUrl)).appendTo($imageCont);
  if(showHover && item.hoverImageUrl) {
    $imageCont.addClass('hover-images--two');
    $('<div class="image-two">').css('background-image', 'url('+item.hoverImageUrl+')').appendTo($imageCont);
  }
  if(item.available === false) {
    $('<span class="product-label product-label--sold-out global-border-radius"></span>').html(theme.strings.soldOut).appendTo($imageCont);
  } else {
    if(item.priceCompare > item.price) {
      $('<span class="product-label product-label--on-sale global-border-radius"></span>').html(theme.strings.onSale).appendTo($imageCont);
    }
  }
  $item.append($title);
  $item.append($priceCont);
  return $item;
};


theme.getRecentProducts = function(){
  var existingValue = window.localStorage.getItem('theme.recent_products');
  if(existingValue) {
    try {
      return JSON.parse(existingValue);
    } catch (error) {}
  }
  return [];
};

theme.addToAndReturnRecentProducts = function(handle, title, available, imageUrl, hoverImageUrl, price, priceVaries, priceCompare){
  var existingArr = theme.getRecentProducts();

  // remove existing occurences
  var run = true;
  while(run) {
    run = false;
    for(var i=0; i<existingArr.length; i++) {
      if(existingArr[i].handle == handle) {
        existingArr.splice(i, 1);
        run = true;
        break;
      }
    }
  }

  // add this onto the end
  existingArr.push({
    handle: handle,
    title: title,
    available: available,
    imageUrl: imageUrl,
    hoverImageUrl: hoverImageUrl,
    price: price,
    priceVaries: priceVaries,
    priceCompare: priceCompare,
    timestamp: new Date().getTime()
  });

  // cap history
  while(existingArr.length > theme.recentProductHistoryCap) {
    existingArr.shift();
  }

  // save updated recent products list
  window.localStorage.setItem('theme.recent_products', JSON.stringify(existingArr));

  return existingArr;
};

// init slideshow
theme.loadRecentlyViewed = function($container){
  theme.peekCarousel.init($container, $('.grid', $container), '.recentlyViewed', function(){
    return $(window).width() < 768
  });
};

// unload slideshow
theme.unloadRecentlyViewed = function($container){
  theme.peekCarousel.destroy($container, $('.slick-initialized', $container), '.recentlyViewed');
};


/*================ Sections ================*/
/**
 * Header Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace header
 */

theme.Header = (function() {
  /**
   * Header section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Header(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);
    this.$nav = $('.site-nav', container);
    this.$navLinks = this.$nav.children('.site-nav__item:not(.site-nav__more-links)');
    this.$navMoreLinksLink = $('.site-nav__more-links', this.$nav);
    this.$navMoreLinksContainer = $('.small-dropdown__container', this.$navMoreLinksLink);
    this.$navMoreLinksSubmenuContainer = $('.site-nav__more-links .more-links__dropdown-container', this.$nav);
    this.search = {
      ongoingRequest: null,
      ongoingTimeoutId: -1,
      throttleMs: 500,
      searchUrlKey: 'searchUrl',
      resultsSelector: '.search-bar__results',
      resultsLoadingClass: 'search-bar--loading-results',
      resultsLoadedClass: 'search-bar--has-results',
      loadingMessage: theme.strings.searchLoading,
      moreResultsMessage: 'See all [COUNT] results',
      emptyMessage: theme.strings.searchNoResults
    };

    var breakpoint = 767;

    $(this.$container).on('click' + this.namespace, '.js-search-form-open', this.searchFormOpen.bind(this));
    $(this.$container).on('click' + this.namespace, '.js-search-form-focus', this.searchFormFocus.bind(this));
    $(this.$container).on('click' + this.namespace, '.js-search-form-close', this.searchFormClose.bind(this));
    $(this.$container).on('click' + this.namespace, '.js-mobile-menu-icon', this.mobileMenuOpen.bind(this));
    $(this.$container).on('click' + this.namespace, '.js-close-mobile-menu', this.mobileMenuClose.bind(this));
    $(this.$container).on('focusin' + this.namespace, '.search-bar.desktop-only', this.searchFocusIn.bind(this));
    $(this.$container).on('focusout' + this.namespace, '.search-bar.desktop-only', this.searchFocusOut.bind(this));

    if($('.search-bar', this.$container).length) {
      $(this.$container).on('keyup' + this.namespace + ' change' + this.namespace, '.search-bar.desktop-only input[name="q"]', this.updateSearchResults.bind(this));
      $(this.$container).on('submit' + this.namespace, '.search-bar.desktop-only form', this.searchSubmit.bind(this));
    }

    // make hidden search fields un-tabbable
    this.setSearchTabbing.bind(this)();

    $('.focus-tint').on('click' + this.namespace, this.onFocusTintClick.bind(this));

    $('body').toggleClass('header-has-messages', this.$container.find('.store-messages-bar').length > 0);

    /**
     * Header messages bar carousel
     */
    $('.js-messages-slider', this.$container).slick({
      infinite: true,
      autoplay: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      prevArrow: false,
      nextArrow: false
    });

    /**
    * Breakpoint to unslick above 767px
    */
    $('.js-mobile-messages-slider', this.$container).slick({
      infinite: true,
      autoplay: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      mobileFirst: true,
      prevArrow: false,
      nextArrow: false,
      responsive: [
        {
          breakpoint: breakpoint,
          settings: 'unslick'
        }
      ]
    });

    /**
    * Reset the messages slider to use slick when screen size decreased to =< 767px
    */

    $(window).on('debouncedresize' + this.namespace, function(e) {
      $('.js-mobile-messages-slider', this.$container).slick('resize');
    });


    $(this.$container).on('click' + this.namespace, '.mobile-site-nav__icon', function(e){
      e.preventDefault();
      $(this).siblings('.mobile-site-nav__menu').slideToggle(250);
      $(this).toggleClass('submenu-open');
    });


    /**
    * Open login in lightbox
    */
    $(this.$container).on('click' + this.namespace, '.customer-account a[href="/account/login"]', this.loginOpen.bind(this));
    $(this.$container).on('click' + this.namespace, '.customer-account a[href="/account/register"]', this.registerOpen.bind(this));

    // Docked nav
    if(this.$container.hasClass('docking-header')) {
      this.desktopHeaderWasDocked = false;
      this.$dockedDesktopContentsContainer = $('.docked-navigation-container__inner', container);
      this.$dockedDesktopBaseContainer = $('.docked-navigation-container', container);
      this.mobileHeaderWasDocked = false;
      this.$dockedMobileContentsContainer = $('.docked-mobile-navigation-container__inner', container);
      this.$dockedMobileBaseContainer = $('.docked-mobile-navigation-container', container);
      // check now
      (this.dockedNavCheck.bind(this))();
      $(window).on('load' + this.namespace, this.dockedNavCheck.bind(this));
      $(window).on('scroll' + this.namespace, this.dockedNavCheck.bind(this));
      $(window).on('debouncedresize' + this.namespace, this.dockedNavCheck.bind(this));
    }

    // Keep menu in one row
    (this.menuLinkVisibilityCheck.bind(this))();
    $(window).on('load' + this.namespace, this.menuLinkVisibilityCheck.bind(this));
    $(window).on('debouncedresize' + this.namespace, this.menuLinkVisibilityCheck.bind(this));

    // Display of overflow menu
    $(this.$container).on('mouseenter' + this.namespace, '.more-links--with-dropdown .site-nav__item', this.onMoreLinksSubMenuActive.bind(this));

    // nav enhancements
    this.navHoverDelay = 250;
    this.$navLastOpenDropdown = $();
    $(this.$container).on('mouseenter' + this.namespace + ' mouseleave' + this.namespace, '.site-nav__item--has-dropdown', (function(evt){
      var $dropdownContainer = $(evt.currentTarget);
      // delay on hover-out
      if(evt.type == 'mouseenter') {
        clearTimeout(this.navOpenTimeoutId);
        clearTimeout($dropdownContainer.data('navCloseTimeoutId'));
        var $openSiblings = $dropdownContainer.siblings('.open');

        // close all menus but last opened
        $openSiblings.not(this.$navLastOpenDropdown).removeClass('open');
        this.$navLastOpenDropdown = $dropdownContainer;

        // show after a delay, based on first-open or not
        var timeoutDelay = $openSiblings.length == 0 ? 0 : this.navHoverDelay;

        // open it
        var navOpenTimeoutId = setTimeout((function(){
          $dropdownContainer.addClass('open')
            .siblings('.open')
            .removeClass('open');
          var $dropdown = $dropdownContainer.children('.small-dropdown:not(.more-links-dropdown)');
          if($dropdown.length && $dropdownContainer.parent().hasClass('site-nav')) {
            var right = $dropdownContainer.offset().left + $dropdown.outerWidth();
            var transform = '',
                cw = this.$container.outerWidth() - 10;
            if(right > cw) {
              transform = 'translateX(' + (cw - right) + 'px)';
            }
            $dropdown.css('transform', transform);
          }

        }).bind(this), timeoutDelay);

        this.navOpenTimeoutId = navOpenTimeoutId;
        $dropdownContainer.data('navOpenTimeoutId', navOpenTimeoutId);
      } else {
        // cancel opening, and close after delay
        clearTimeout($dropdownContainer.data('navOpenTimeoutId'));
        $dropdownContainer.data('navCloseTimeoutId', setTimeout(function(){
          $dropdownContainer.removeClass('open')
            .children('.small-dropdown:not(.more-links-dropdown)')
            .css('transform', '');
        }, this.navHoverDelay));
      }
      // a11y
      $dropdownContainer.children('[aria-expanded]').attr('aria-expanded', evt.type == 'mouseenter');
    }).bind(this));

    // keyboard nav
    $(this.$container).on('keydown' + this.namespace, '.site-nav__item--has-dropdown > .site-nav__link', this.dropdownLinkKeyPress.bind(this));

    // touch events
    $(this.$container).on('touchstart' + this.namespace + ' touchend' + this.namespace + ' click' + this.namespace, '.site-nav__item--has-dropdown > .site-nav__link', function(evt){
      if(evt.type == 'touchstart') {
        $(this).data('touchstartedAt', evt.timeStamp);
      } else if(evt.type == 'touchend') {
        // down & up in under a second - presume tap
        if(evt.timeStamp - $(this).data('touchstartedAt') < 1000) {
          $(this).data('touchOpenTriggeredAt', evt.timeStamp);
          if($(this).parent().hasClass('open')) {
            // trigger close
            $(this).parent().trigger('mouseleave');
          } else {
            // trigger close on any open items
            $('.site-nav__item.open').trigger('mouseleave');
            // trigger open
            $(this).parent().trigger('mouseenter');
          }
          // prevent fake click
          return false;
        }
      } else if(evt.type == 'click') {
        // if touch open was triggered very recently, prevent click event
        if($(this).data('touchOpenTriggeredAt') && evt.timeStamp - $(this).data('touchOpenTriggeredAt') < 1000) {
          return false;
        }
      }
    });
  };

  Header.prototype = $.extend({}, Header.prototype, {
    /**
      * Press return on dropdown parent to reveal children
      */
    dropdownLinkKeyPress: function(evt) {
      if(evt.which == 13) {
        if($(evt.target).closest('.site-nav__dropdown').length && $(evt.target).closest('.more-links').length) {
          // in more-links
          $(evt.target).trigger('mouseenter');
        } else {
          // normal dropdown
          var isOpen = $(evt.target).closest('.site-nav__item--has-dropdown').toggleClass('open').hasClass('open');
          // a11y
          $(evt.target).attr('aria-expanded', isOpen);
        }
        return false;
      }
    },

    /**
      * Ensure hidden search forms cannot be tabbed to
      */
    setSearchTabbing: function(evt) {
      $('.search-bar', this.$container).each(function(){
        if($(this).css('pointer-events') == 'none') {
          $(this).find('a, input, button').attr('tabindex', '-1');
        } else {
          $(this).find('a, input, button').removeAttr('tabindex');
        }
      });
    },

    /**
     * Event on focus of a more-links top-level link
     */
    onMoreLinksSubMenuActive: function(evt) {
      this.$navMoreLinksSubmenuContainer.empty();
      var $childMenu = $(evt.currentTarget).children('.site-nav__dropdown');
      if($childMenu.length) {
        var $clone = $childMenu.clone();
        // alter layout of mega nav columns
        $clone.find('.mega-dropdown__container .one-third').removeClass('one-third').addClass('one-half');
        $clone.find('.mega-dropdown__container .one-quarter').removeClass('one-quarter').addClass('one-third');
        $clone.find('.site-nav__promo-container > .three-quarters').removeClass('three-quarters').addClass('two-thirds');
        $clone.find('.site-nav__promo-container > .one-quarter').removeClass('one-quarter').addClass('one-third');
        // add to visible container
        $clone.appendTo(this.$navMoreLinksSubmenuContainer);
      }
      var submenuHeight = this.$navMoreLinksSubmenuContainer.outerHeight() + 30; // extra for nav padding
      this.$navMoreLinksSubmenuContainer.parent().css('min-height', submenuHeight);
      $(evt.currentTarget)
        .removeClass('more-links__parent--inactive')
        .addClass('more-links__parent--active')
        .siblings()
        .removeClass('more-links__parent--active')
        .addClass('more-links__parent--inactive');
      // a11y
      $(evt.target).attr('aria-expanded', true);
      $(evt.target).parent().siblings().find('a').attr('aria-expanded', false);
    },

    /**
     * Event for checking visible links in menu
     */
    menuLinkVisibilityCheck: function(evt) {
      var navWidth = this.$nav.width();
      var moreLinksWidth = this.$navMoreLinksLink.width();

      // check if we have too many links to show
      var spacingOffset = 4; // inline elements
      var total = 0;
      this.$navLinks.each(function(){
        total += $(this).width() + spacingOffset;
      });

      if(total > navWidth) {
        // calculate which links to move
        total = moreLinksWidth;
        var $_ref = this.$navMoreLinksContainer.empty();
        this.$navLinks.each(function(){
          total += $(this).width() + spacingOffset;
          if(total > navWidth) {
            $_ref.append(
              $(this).clone().removeClass('site-nav__invisible')
            );
            $(this).addClass('site-nav__invisible').find('a').attr('tabindex', '-1');
          } else {
            $(this).removeClass('site-nav__invisible').find('a').removeAttr('tabindex');
          }
        });
        this.$navMoreLinksContainer.find('a').removeAttr('tabindex');
        this.$navMoreLinksLink.removeClass('site-nav__invisible');
        this.$navMoreLinksLink.toggleClass('more-links--with-dropdown', this.$navMoreLinksLink.find('.small-dropdown:first, .mega-dropdown:first').length > 0);
        this.$navMoreLinksLink.toggleClass('more-links--with-mega-dropdown', this.$navMoreLinksLink.find('.mega-dropdown:first').length > 0);
        this.$navMoreLinksContainer.find('.small-dropdown').css('transform', '');
      } else {
        // hide more-links
        this.$navLinks.removeClass('site-nav__invisible');
        this.$navMoreLinksLink.addClass('site-nav__invisible');
        this.$navMoreLinksContainer.empty();
      }
    },

    /**
     * Event for showing the login in a modal
     */
    loginOpen: function(evt) {
      evt.preventDefault();
      theme.openPageContentInLightbox('/account/login');
    },

    /**
     * Event for showing the registration form in a modal
     */
    registerOpen: function(evt) {
      evt.preventDefault();
      theme.openPageContentInLightbox('/account/register');
    },

    /**
     * Event for showing the search bar
     */
    searchFormOpen: function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      $('body').addClass('search-bar-open');
      $('.search-bar:not(.mobile-menu-search):visible input[name="q"]', this.$container).focus();
      this.setSearchTabbing.bind(this)();
    },

    /**
     * Event for transferring focus to the search bar input
     */
    searchFormFocus: function(evt) {
      $('.search-bar:visible input[name="q"]', this.$container).focus();
    },

    /**
     * Event for closing the search bar
     */
    searchFormClose: function(evt) {
      $('body').removeClass('search-bar-open');
      this.setSearchTabbing.bind(this)();
      // focus on the open button
      if(evt && evt.target) {
        $(evt.target).closest('.search-bar').prev('a').focus().blur();
      }
    },

    /**
     * Event for when focus enters the search bar
     */
    searchFocusIn: function(evt) {
      // ensure focus class is added by clearing any associated class removal
      clearTimeout(this.searchFocusOutTimeout);
      $('body').addClass('search-bar-in-focus');
    },

    /**
     * Event for when focus leaves the search bar
     */
    searchFocusOut: function(evt) {
      // defer in case focus on another element requires cancelling this
      this.searchFocusOutTimeout = setTimeout(function(){
        $('body').removeClass('search-bar-in-focus');
      }, 10);
    },

    /**
     * Event for clicks on the page focus tint
     */
    onFocusTintClick: function(evt) {
      this.searchFormClose.bind(this)();
      return false;
    },

    /**
     * Event for showing the mobile navigation
     */
    mobileMenuOpen: function(evt) {
      $('.header-navigation', this.$container).addClass('header-navigation--open');
      $(document.body, this.$container).addClass('mobile-menu-open');
    },

    /**
     * Event for closing the mobile navigation
     */
    mobileMenuClose: function(evt) {
      $('.header-navigation', this.$container).removeClass('header-navigation--open');
      $(document.body, this.$container).removeClass('mobile-menu-open');
    },

    /**
     * Event for submitting search form - mimic live-search results
     */
    searchSubmit: function(evt) {
      evt.preventDefault();
      window.location = this._buildSearchUrl($(evt.target));
    },

    /**
     * Event for fetching new search results
     */
    updateSearchResults: function(evt) {
      var $form = $(evt.target).closest('form');
      var $bar = $form.closest('.search-bar');

      // build search url
      searchUrl = this._buildSearchUrl($form);

      // has results url changed?
      if(searchUrl != $form.data(this.search.searchUrlKey)) {
        $form.data(this.search.searchUrlKey, searchUrl);

        // cancel any ongoing request
        this._abortSearch.bind(this)();

        // hide results if under 3 characters entered
        var term = $form.find('input[name="q"]').val();
        if(term.length < 3) {
          this._searchResultsHide.bind(this)($bar);
        } else {
          // fetch results
          $bar.addClass(this.search.resultsLoadingClass);
          $bar.find(this.search.resultsSelector).html('<div class="search-result search-result--loading">' + this.search.loadingMessage + '</div>');
          this.search.ongoingTimeoutId = setTimeout(this._fetchResults.bind(this, searchUrl, $bar), this.search.throttleMs);
        }
      }
    },

    /**
     * Cancel current search
     */
    _abortSearch: function() {
      if(this.search.ongoingRequest) {
        this.search.ongoingRequest.abort();
      }
      clearTimeout(this.search.ongoingTimeoutId);
    },

    /**
     * Immediately fetch search results
     */
    _buildSearchUrl: function($form) {
      var searchUrl = $form.attr('action');
      $(':input[name]', $form).each(function(index){
        // divider
        searchUrl += index == 0 ? '?' : '&';
        // param
        searchUrl += $(this).attr('name') + '=';
        if($(this).is('[name="q"]')) {
          searchUrl += encodeURI($(this).val()) + '*';
        } else {
          searchUrl += encodeURI($(this).val());
        }
      });
      return searchUrl;
    },

    /**
     * Immediately fetch search results
     */
    _fetchResults: function(searchUrl, $bar) {
      this.search.ongoingRequest = $.getJSON(
        searchUrl + '&view=json',
        this._searchResultsSuccess.bind(this, $bar, searchUrl)
      ).error(function($bar, request){
        console.log('Error fetching results');
        console.log(request);
        this._searchResultsHide.bind(this, $bar);
      }.bind(this, $bar)).complete(function(){
        this.search.ongoingRequest = null;
      }.bind(this));
    },

    /**
     * Success fetching results - build and show
     */
    _searchResultsSuccess: function($bar, searchUrl, response) {
      $bar.addClass(this.search.resultsLoadedClass).removeClass(this.search.resultsLoadingClass);
      var $results = $('<div>');
      if(response.results.length > 0) {
        for(var i = 0; i < response.results.length; i++) {
          var $result = $('<a class="search-result">')
            .attr('href', response.results[i].url)
            .append($('<span class="search-result__title">').text(response.results[i].title));
          var $thumb;
          if(response.results[i].thumb) {
            $thumb = $('<span class="search-result__image">').append( $('<img>').attr('src', response.results[i].thumb) );
          } else {
            $thumb = $('<span class="search-result__image">').append( $('<span class="search-result__char">').html(response.results[i].title[0]) );
          }
          $result.prepend($thumb).appendTo($results);
        }
        if(response.results.length < response.results_count) {
          $('<a class="search-result search-result--more">')
            .attr('href', searchUrl)
            .html(this.search.moreResultsMessage.replace('[COUNT]', response.results_count))
            .appendTo($results);
        }
      } else {
        $results.append('<div class="search-result search-result--empty">' + this.search.emptyMessage + '</div>');
      }
      $bar.find(this.search.resultsSelector).html($results);
    },

    /**
     * Empty and hide search results
     */
    _searchResultsHide: function($bar) {
      $bar.removeClass(this.search.resultsLoadedClass)
        .removeClass(this.search.resultsLoadingClass)
        .find(this.search.resultsSelector)
        .empty();
    },

    /**
     * Check if we should dock both desktop/mobile header
     */
    dockedNavCheck: function(evt) {
      var scrollTop = $(window).scrollTop();
      var desktopShouldDock = $(window).width() >= theme.dockedNavDesktopMinWidth && this.$dockedDesktopBaseContainer.offset().top < scrollTop;
      var mobileShouldDock = $(window).width() < theme.dockedNavDesktopMinWidth && this.$dockedMobileBaseContainer.offset().top < scrollTop;

      if(desktopShouldDock) {
        // set dock placeholder height
        this.$dockedDesktopBaseContainer.css('height', this.$dockedDesktopContentsContainer.outerHeight());
      } else {
        // remove placeholder height if undocking
        if(this.desktopHeaderWasDocked) {
          this.$dockedDesktopBaseContainer.css('height', '');
        }
      }

      if(mobileShouldDock) {
        // set dock placeholder height
        this.$dockedMobileBaseContainer.css('height', this.$dockedMobileContentsContainer.outerHeight());
      } else {
        // remove placeholder height if undocking
        if(this.mobileHeaderWasDocked) {
          this.$dockedMobileBaseContainer.css('height', '');
        }
      }

      this.$container.toggleClass('docked-header--dock', desktopShouldDock || mobileShouldDock);

      // check menu links if width of nav has changed
      if(desktopShouldDock != this.desktopHeaderWasDocked) {
        (this.menuLinkVisibilityCheck.bind(this))();
      }

      this.desktopHeaderWasDocked = desktopShouldDock;
      this.mobileHeaderWasDocked = mobileShouldDock;
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      $('.focus-tint').off(this.namespace);
      $(window).off(this.namespace);
      $('.js-messages-slider', this.$container).slick('unslick');
      $('.js-mobile-messages-slider', this.$container).slick('unslick');
    }
  });

  return Header;
})();

/**
 * Footer Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the List Collections template.
 *
   * @namespace Footer
 */

theme.Footer = (function() {
  /**
   * Footer section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Footer(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // sticky footer
    this.$stickyFooter = $('.sticky-footer', container);
    // clear classes set outside of this container
    $('body').removeClass('sticky-footer-not-visible sticky-footer-partly-visible sticky-footer-fully-visible sticky-footer-taller-than-page sticky-footer-scrolled-into');
    // if sticky, assign events
    if(this.$stickyFooter.length){
      this.stickyResize.bind(this)();
      this.stickyScroll.bind(this)();
      $(window).on('debouncedresize' + this.namespace, this.stickyResize.bind(this));
      $(window).on('scroll' + this.namespace, this.stickyScroll.bind(this));
    } else {
      // if footer is not sticky, check if it needs pushing down on short pages
      this.$footerInner = this.$container.find('.page-footer__inner ');
      this.pushDown.bind(this)();
      $(window).on('load' + this.namespace, this.pushDown.bind(this));
      $(window).on('debouncedresize' + this.namespace, this.pushDown.bind(this));
    }
  };

  Footer.prototype = $.extend({}, Footer.prototype, {
    /**
     * Push footer down on short pages, so it meets the edge of the viewport
     */
    pushDown: function() {
      var gap = $(window).height() - (this.$container.offset().top + this.$footerInner.outerHeight());
      if(gap > 0) {
        this.$container.css('padding-top', gap);
      } else {
        this.$container.css('padding-top', '');
      }
    },

    /**
     * Set a class to indicate if we've scrolled into the footer
     */
    stickyScroll: function() {
      $('body').toggleClass(
        'sticky-footer-scrolled-into',
        $(window).scrollTop() > this.$container.offset().top
      );
    },

    /**
     * Set footer container height and various utility classes
     */
    stickyResize: function() {
      var footerHeight = this.$stickyFooter.outerHeight();
      var footerOffsetTop = this.$container.offset().top;

      var partlyVisible      = footerOffsetTop < $(window).height(),
          fullyVisible       = footerOffsetTop + footerHeight < $(window).height(),
          tallerThanPage     = footerHeight > $(window).height();

      // classes to define footer state when at the top of scroll
      $('body').toggleClass('sticky-footer-not-visible', !partlyVisible); // fully off-screen
      $('body').toggleClass('sticky-footer-partly-visible', partlyVisible && !fullyVisible); // partially off-screen
      $('body').toggleClass('sticky-footer-fully-visible', fullyVisible); // entirely on-screen
      $('body').toggleClass('sticky-footer-taller-than-page', tallerThanPage); // footer is taller than the viewport

      // match in-page footer container to sticky footer height
      this.$container.css('min-height', footerHeight);
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      $(window).off(this.namespace);
    }
  });

  return Footer;
})();

/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
   * @namespace product
 */

theme.Product = (function() {

  var selectors = $.extend({}, theme.variants.selectors, {
    productJson: '[data-product-json]',
    productImagesContainer: '.product-detail__images',
    productThumbs: '[data-product-single-thumbnail]',
    singleOptionSelector: '[data-single-option-selector]',
    stickyColumnSelector: '.sticky-element',
    skuWrapper: '.sku-wrapper',
    sku: '.sku-wrapper__sku',
    styledSelect: '.selector-wrapper select',
    relatedProductsCarousel: '.js-related-product-carousel',
    recentlyViewed: '.recently-viewed'
  });

  /**
   * Product section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Product(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$(selectors.productJson, this.$container).html()) {
      return;
    }

    var sectionId = this.$container.attr('data-section-id');
    this.productSingleObject = JSON.parse($(selectors.productJson, this.$container).html());

    var options = {
      $container: this.$container,
      enableHistoryState: this.$container.data('enable-history-state') || false,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    };

    this.settings = {};
    this.settings.imageSize = 'master';
    this.variants = new slate.Variants(options);
    this.$productThumbs = $(selectors.productThumbs, this.$container);
    this.$stickyColumns = $(selectors.stickyColumnSelector, this.$container);

    this.$container.on('variantChange' + this.namespace, theme.variants.updateAddToCartState.bind(this));
    this.$container.on('variantPriceChange' + this.namespace, theme.variants.updateProductPrices.bind(this));

    if(this.$container.find(selectors.skuWrapper)) {
      this.$container.on('variantChange' + this.namespace, this.updateSKU.bind(this));
    }

    this.$container.on('variantChange' + this.namespace, this.onDetailHeightChange.bind(this));

    if (this.$productThumbs.length > 0) {
      this.$container.on('variantImageChange' + this.namespace, this.updateProductImage.bind(this));
      $(document).on('click' + this.namespace + ' keydown' + this.namespace, (function(){
        this.$productThumbs.not('.variant-dim--fixed').removeClass('variant-dim');
      }).bind(this));
      $(window).on('scroll' + this.namespace + ' ontouchstart' + this.namespace, (function(){
        this.$productThumbs.not('.variant-dim--fixed').removeClass('variant-dim');
      }).bind(this));
    }

    // image zoom
    this.$container.on('click' + this.namespace, selectors.productThumbs, this.openGallery.bind(this));

    // mobile image slideshow
    this.imageSlideshowActive = false;
    $(window).on('debouncedresize' + this.namespace, this.assessImageSlideshow.bind(this));
    this.assessImageSlideshow.bind(this)();

    // sticky columns
    if (this.$productThumbs.length > 0) {
      // - set up image column dimensions for variant images
      this.$stickyForceHeightStyleTag = $('<style></style>').appendTo(document.body);
      this.setupVariantImagesScrollHeight.bind(this)();
      $(window).on('debouncedresize' + this.namespace, this.setupVariantImagesScrollHeight.bind(this));
    }

    // - continue with sticky column setup
    this.stickyColumnsAreSticky = false;
    this.assessStickyColumns.bind(this)();
    $(window).on('debouncedresize' + this.namespace, this.assessStickyColumns.bind(this));

    // style dropdowns
    theme.styleVariantSelectors($(selectors.styledSelect, container), options.product);

    // compensate for tabs conflicting with sticky columns and scrolling
    this.$container.on('click', selectors.stickyColumnSelector + ' .tabs a', this.onDetailHeightChange.bind(this));

    // size chart
    this.$container.on('click', '.js-size-chart-open', function(e){
      e.preventDefault();
      $('body').addClass('size-chart-is-open');
    });

    this.$container.on('click', '.js-size-chart-close', function(){
      $('body').removeClass('size-chart-is-open');
    });

    // related products
    if($(selectors.relatedProductsCarousel, this.$container).length) {
      this.$relatedProductsCarousel = $(selectors.relatedProductsCarousel, container);
      this.relatedProductsLayout.bind(this)();
      $(window).on('debouncedresize' + this.namespace, this.relatedProductsLayout.bind(this));
    }

    // recently viewed
    this.$recentlyViewed = $(selectors.recentlyViewed, this.$container);
    if(this.$recentlyViewed.length) {
      this.loadRecentlyViewed.bind(this)();
      theme.loadRecentlyViewed(this.$recentlyViewed);
    }

    // section may contain RTE images
    theme.assessRTEImagesOnLoad(this.$container);
  }

  Product.prototype = $.extend({}, Product.prototype, {
    /**
     * Ensure variant images can scroll correctly by setting some dimensions
     */
    setupVariantImagesScrollHeight: function(evt) {
      // make sure the variant column can show the selected image with product title at the top
      var $imagesContainer = $(selectors.productImagesContainer, this.$container);
      if($(window).width() > 767) {
        var detailColumnHeight = this.$stickyColumns.last().height(); // first contains small imgs to left of gallery
        var visibleDetailColumnHeight = $(window).height() - theme.dockedNavHeight();
        var extraPadding = Math.max(0, detailColumnHeight - visibleDetailColumnHeight);
        $imagesContainer.css('padding-bottom', extraPadding);
      } else {
        $imagesContainer.css('padding-bottom', '');
      }
      // ensure docking the sticky column to the top handles the docked nav
      this.$stickyForceHeightStyleTag.html('.sticky-force-zero-top { top: '+theme.dockedNavHeight()+'px !important }');
    },

    /**
     * On tab selection, check if sticky column is showing correctly
     */
    onDetailHeightChange: function(evt) {
      if(this.stickyColumnsAreSticky) {
        // stickykit must recalculate contents after reflow
        setTimeout((function(){
          $(document.body).trigger('sticky_kit:recalc');
          this.setupVariantImagesScrollHeight.bind(this)();
        }).bind(this), 15);
      }
    },

    /**
     * Display recently viewed products, and add this page to it
     */
    loadRecentlyViewed: function(evt) {
      // feature usability detect
      if(theme.storageAvailable('localStorage')) {
        var recentDisplayCount = 6;

        var existingArr = theme.addToAndReturnRecentProducts(
          this.$recentlyViewed.data('handle'),
          this.$recentlyViewed.data('title'),
          this.$recentlyViewed.data('available'),
          this.$recentlyViewed.data('image'),
          this.$recentlyViewed.data('image2'),
          this.$recentlyViewed.data('price'),
          this.$recentlyViewed.data('price-varies'),
          this.$recentlyViewed.data('price-compare'));

        // check each recent product, excluding one just added
        if(existingArr.length > 1) {
          var $recentlyViewedBucket = this.$recentlyViewed.removeClass('hidden').find('.grid');
          var showHoverImage = this.$recentlyViewed.data('show-hover-image'),
            rangeStart = Math.max(0, existingArr.length - recentDisplayCount - 1),
            rangeEnd = existingArr.length - 1;
          for(var i = rangeStart; i < rangeEnd; i++) {
            theme.addRecentProduct(existingArr, i, $recentlyViewedBucket, showHoverImage);
          }
        }
      }
    },

    /**
     * Updates the SKU
     */
    updateSKU: function(evt) {
      var variant = evt.variant;

      if (variant && variant.sku) {
        $(selectors.skuWrapper, this.$container).removeClass('sku-wrapper--empty');
        $(selectors.sku, this.$container).html(variant.sku);
      } else {
        $(selectors.skuWrapper, this.$container).addClass('sku-wrapper--empty');
        $(selectors.sku, this.$container).empty();
      }
    },

    /**
     * Scrolls the page to the specified image
     *
     * @param {string} src - Image src URL
     */
    updateProductImage: function(evt) {
      var variant = evt.variant;
      var matchSrc = slate.Image.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);
      var $found = this.$productThumbs.filter(function(){
        return $(this).attr('href') == matchSrc;
      });
      if($found.length == 1) {
        var $imagesContainer = $(selectors.productImagesContainer, this.$container);
        if($imagesContainer.hasClass('slick-slider')) {
          var $slide = $found.closest('.slick-slide');
          $imagesContainer.slick('slickGoTo', $slide.data('slick-index'));
        } else {
          // requires a delay (for some reason)
          clearTimeout(this.variantScrollTimeoutId);
          this.variantScrollTimeoutId = setTimeout((function(){
            var desiredScrollTop = $found.offset().top - theme.dockedNavHeight();
            var $cont = $found.closest('.product-detail');
            var maxScrollTop = $cont.offset().top + $cont.height() - $cont.find('.product-detail__detail').outerHeight() - 20;
            // force the docked area to the top of the visible area
            this.$stickyColumns.addClass('sticky-force-zero-top');
            this.$stickyColumns.trigger('sticky_kit:zero_top');
            $('html,body').animate({
              scrollTop: Math.min(desiredScrollTop, maxScrollTop)
            }, 500, (function(){
              $found.removeClass('variant-dim');
              this.$productThumbs.not($found).addClass('variant-dim variant-dim--fixed');
              setTimeout(function(){
                $('.variant-dim--fixed').removeClass('variant-dim--fixed');
              }, 500);
              // custom functionality to reset the top position
              this.$stickyColumns.trigger('sticky_kit:zero_top');
              this.$stickyColumns.removeClass('sticky-force-zero-top');
            }).bind(this));
          }).bind(this), 25);
        }
      }
    },

    /**
     * Set/unset sticky columns depending on screen size
     */
    assessStickyColumns: function(evt) {
      var windowWidth = $(window).width();
      if(windowWidth < 768) {
        if(this.stickyColumnsAreSticky) {
          this.$stickyColumns.trigger('sticky_kit:detach');
          this.stickyColumnsAreSticky = false;
        }
      } else {
        if(!this.stickyColumnsAreSticky) {
          this.$stickyColumns.stick_in_parent({
            parent: this.$stickyColumns.closest('.grid'),
            spacer: '.sticky-spacer',
            offset_top: theme.dockedNavHeight()
          });
          this.stickyColumnsAreSticky = true;
        }
      }
    },

    /**
     * Create/destroy slideshow depending on screen width
     */
    assessImageSlideshow: function(evt) {
      var windowWidth = $(window).width();
      var count = false;
      if($(selectors.productImagesContainer).children().length > 1){
        count = true;
      }
      if(windowWidth < 768) {
        if(!this.imageSlideshowActive) {
          $(selectors.productImagesContainer, this.$container).slick({
            adaptiveHeight: true,
            arrows: false,
            dots: count
          });
          this.imageSlideshowActive = true;
        }
      } else {
        if(this.imageSlideshowActive) {
          $(selectors.productImagesContainer, this.$container).slick('unslick');
          this.imageSlideshowActive = false;
        }
      }
    },

    /**
     * Show gallery of all product images
     */
    openGallery: function(evt) {
      evt.preventDefault();

      var pswpElement = document.querySelectorAll('.pswp')[0];

      var items = [];
      $('.product-detail__images [data-product-single-thumbnail]').each(function(){
        var item = {
          src: $(this).attr('href'),
          w: $(this).data('image-w'),
          h: $(this).data('image-h')
        };
        var img = $(this).find('img')[0];
        if(typeof img.currentSrc !== 'undefined') {
          item.msrc = img.currentSrc;
        }
        items.push(item);
      });

      var options = {
        index: $(evt.target).closest('a').data('image-index'),
        history: false,
        captionEl: false,
        shareEl: false,
        fullscreenEl: false,
        getThumbBoundsFn: (function(index) {
          var thumbnail = this.$productThumbs[index].getElementsByTagName('img')[0],
            pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
            rect = thumbnail.getBoundingClientRect();

          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
        }).bind(this)
      };

      // Initializes and opens PhotoSwipe
      this.imageGallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
      this.imageGallery.init();
      this.imageGallery.listen('destroy', (function(){
        this.imageGallery = null;
      }).bind(this));
    },

    /**
     * Switch to carousel view for related products on mobile
     */
    relatedProductsLayout: function(evt) {
      var windowWidth = $(window).width();
      if(windowWidth < 768) {
        if(!this.$relatedProductsCarousel.hasClass('slick-initialized')){
          $(this.$relatedProductsCarousel).slick({
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            swipeToSlide: true,
            dots: false,
            arrows: false
          });
        }
      } else {
        if(this.$relatedProductsCarousel.hasClass('slick-initialized')){
          this.$relatedProductsCarousel.slick('unslick');
        };
      }
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      $(document).off(this.namespace);
      $(window).off(this.namespace);
      this.$stickyColumns.trigger('sticky_kit:detach');
      if(this.imageGallery) {
        this.imageGallery.close();
      }
      if(this.$recentlyViewed.length) {
        theme.unloadRecentlyViewed(this.$recentlyViewed);
      }
      this.$container.find('.slick-initialized').slick('unslick');
      if(this.$productThumbs.length) {
        this.$stickyForceHeightStyleTag.remove();
      }
    }
  });

  return Product;
})();

/**
 * Blog Template Script
 * ------------------------------------------------------------------------------
 * For both the blog page and homepage section
 *
   * @namespace blog
 */

theme.Blog = (function() {

  var selectors = {
    stickyColumn: '.sticky-element',
    header: '.featured-blog__header, .blog-featured-image',
    headerImage: '.featured-blog__header-image, .blog-image',
    slideshow: '.js-content-products-slider .grid'
  };

  var breakpoint = 768;
  var resizeTimer;

  /**
   * Blog section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Blog(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // sticky columns
    this.$stickyColumns = $(selectors.stickyColumn, this.$container);
    this.stickyColumnsAreSticky = false;

    // header spacing/image
    this.$header = $(selectors.header, this.$container);
    this.$headerImage = $(selectors.headerImage, this.$container);

    // peek carousel (must be before sticky checks)
    $('.js-content-products-slider .grid', this.$container).each((function(index, value){
      theme.peekCarousel.init(
        this.$container,
        $(value),
        this.namespace,
        function(){ return true },
        false,
        {
          infinite: false,
          slidesToShow: 3,
          slidesToScroll: 1,
          swipeToSlide: true,
          dots: false,
          prevArrow: $(value).closest('.content-products').find('.content-products-controls .prev'),
          nextArrow: $(value).closest('.content-products').find('.content-products-controls .next'),
          responsive: [
            {
              breakpoint: $('.single-column-layout', this.$container).length ? 768 : 960,
              settings: {
                slidesToShow: 1,
              }
            }
          ]
        }
      );
    }).bind(this));

    //Section
    this.assessSection.bind(this)();
    $(window).on('debouncedresize' + this.namespace, this.assessSection.bind(this));
  }

  Blog.prototype = $.extend({}, Blog.prototype, {
    /**
     * Set/unset sticky columns depending on screen size
     */
    assessSection: function(evt) {
      var windowWidth = $(window).width();
      if(windowWidth < 768) {
        this.$headerImage.css('height', '');
        if(this.stickyColumnsAreSticky) {
          this.$stickyColumns.trigger('sticky_kit:detach');
          this.stickyColumnsAreSticky = false;
        }
      } else {
        var headerPadding = parseInt(this.$header.css('padding-top'));
        this.$headerImage.css('height', $(window).height() - headerPadding*2 - theme.dockedNavHeight());
        if(!this.stickyColumnsAreSticky) {
          this.$stickyColumns.stick_in_parent({
            parent: this.$stickyColumns.closest('.grid, .grid-no-gutter'),
            offset_top: theme.dockedNavHeight()
          });
          this.stickyColumnsAreSticky = true;
        }
      }
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      this.$stickyColumns.trigger('sticky_kit:detach');
      theme.peekCarousel.destroy(this.$container, $('.js-content-products-slider .grid', this.$container), this.namespace);
    }
  });

  return Blog;
})();

/**
 * Article Template Script
 * ------------------------------------------------------------------------------
 * For both the article page
 *
   * @namespace article
 */

theme.Article = (function() {
  var selectors = {
    stickyColumn: '.sticky-element',
    slideshow: '.js-content-products-slider .grid'
  };

  /**
   * Article section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Article(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);
    var rteWidth = $('.template-article .rte').width();

    // sticky columns
    this.$stickyColumns = $(selectors.stickyColumn, this.$container);
    this.stickyColumnsAreSticky = false;

    //Slideshow
    this.$slideshow = $(selectors.slideshow, this.$container);

    $(this.$slideshow).slick({
      infinite: false,
      slidesToShow: 3,
      slidesToScroll: 1,
      swipeToSlide: true,
      dots: false,
      prevArrow: $('.content-products-controls .prev', this.$container),
      nextArrow: $('.content-products-controls .next', this.$container),
      responsive: [
          {
            breakpoint: $('.single-column-layout', container).length ? 768 : 960,
            settings: {
              slidesToShow: 1
            }
          }
        ]
    });

    //Section
    this.assessSection.bind(this)();
    $(window).on('debouncedresize' + this.namespace, this.assessSection.bind(this));

    // section may contain RTE images
    theme.assessRTEImagesOnLoad(this.$container);
  }


  Article.prototype = $.extend({}, Article.prototype, {
    /**
     * Set/unset sticky columns depending on screen size
     */
    assessSection: function(evt) {
      var windowWidth = $(window).width();
      if(windowWidth < 768) {
        if(this.stickyColumnsAreSticky) {
          this.$stickyColumns.trigger('sticky_kit:detach');
          this.stickyColumnsAreSticky = false;
        }
      } else {
        if(!this.stickyColumnsAreSticky) {
          this.$stickyColumns.stick_in_parent({
            parent: this.$stickyColumns.closest('.grid, .grid-no-gutter'),
            offset_top: 30
          });
          this.stickyColumnsAreSticky = true;
        }
      }
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      this.$stickyColumns.trigger('sticky_kit:detach');
      $('.js-content-products-slider .grid', this.$container).slick('unslick');
    }
  });

  return Article;
})();

/**
 * Slideshow Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace Slideshow
 */

theme.Slideshow = (function() {
  /**
   * Slideshow section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Slideshow(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);
    this.$slideshow = $('.js-slideshow-section', this.$container);

    /**
     * Slick slideshow
     */
    var count = false;
    if(this.$slideshow.children().length > 1){
      var count = true;
    }
    this.$slideshow.slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: count,
      adaptiveHeight: false,
      autoplay: this.$slideshow.data('autoplay'),
      autoplaySpeed: this.$slideshow.data('autoplayspeed'),
      prevArrow: $('.full-width-slideshow-controls .prev', this.$container),
      nextArrow: $('.full-width-slideshow-controls .next', this.$container)
    });

    $(window).on('debouncedresize' + this.namespace, this.onResize.bind(this));
  };

  Slideshow.prototype = $.extend({}, Slideshow.prototype, {
    /**
     * Event callback for window resize
     */
    onResize: function(evt) {
      // fix slick bug where height does not adapt to content height on resize
      this.$slideshow.slick('setPosition');
    },

    /**
     * Event callback for Theme Editor `shopify:block:select` event
     */
    onBlockSelect: function(evt) {
      this.$slideshow
        .slick('slickGoTo', $(evt.target).data('slick-index'), true)
        .slick('slickPause');
    },

    /**
     * Event callback for Theme Editor `shopify:block:deselect` event
     */
    onBlockDeselect: function(evt) {
      this.$slideshow.slick('slickPlay');
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      this.$slideshow.slick('unslick');
    }
  });

  return Slideshow;
})();

/**
 * Standout collection Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace StandoutCollection
 */

theme.StandoutCollection = (function() {
  /**
   * StandoutCollection section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function StandoutCollection(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    /**
     * Slick StandoutCollection
     */
    theme.peekCarousel.init(
      this.$container,
      $('.js-standout-collection-slider', this.$container),
      this.namespace,
      function(){ return true },
      false,
      {
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        prevArrow: $('.standout-collection-slider__controls .prev', this.$container),
        nextArrow: $('.standout-collection-slider__controls .next', this.$container)
      }
    );
  };

  StandoutCollection.prototype = $.extend({}, StandoutCollection.prototype, {
    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      theme.peekCarousel.destroy(this.$container, $('.js-standout-collection-slider', this.$container), this.namespace);
    }
  });

  return StandoutCollection;
})();

/**
 * Get The Look Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace get-the-look
 */

theme.GetTheLook = (function() {
  var selectors = {
    stickyColumn: '.sticky-element',
    header: '.get-the-look__image-container',
    headerImage: '.get-the-look__image-container .placeholder-svg, .get-the-look__image-container .rimage-outer-wrapper',
    slideshow: '.js-get-the-look-slider',
    product: '.get-the-look__product:first'
  };

  var breakpoint = 768;
  var resizeTimer;

  function GetTheLook(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // sticky columns
    this.$stickyColumns = $(selectors.stickyColumn, this.$container);
    this.stickyColumnsAreSticky = false;

    // header spacing/image
    this.$header = $(selectors.header, this.$container);
    this.$headerImage = $(selectors.headerImage, this.$container);

    // slideshow
    this.$slideshow = $(selectors.slideshow, this.$container);

    // first product
    this.$firstProduct = $(selectors.product, this.$container);

    // peek carousel (must be before sticky checks)
    theme.peekCarousel.init(this.$container, this.$slideshow, this.namespace, (function(){
      return this.$firstProduct.length && parseInt(this.$firstProduct.css('margin-right')) == 0;
    }).bind(this));

    // section
    this.assessSection.bind(this)();
    $(window).on('debouncedresize' + this.namespace, this.assessSection.bind(this));
  };

  GetTheLook.prototype = $.extend({}, GetTheLook.prototype, {

    /**
     * Set/unset sticky columns depending on screen size
     */
    assessSection: function(evt) {
      if(this.$firstProduct.length && parseInt(this.$firstProduct.css('margin-right')) == 0) {
        this.$headerImage.css('height', '');
        if(this.stickyColumnsAreSticky) {
          this.$stickyColumns.trigger('sticky_kit:detach');
          this.stickyColumnsAreSticky = false;
        }
      } else {
        var headerPadding = 30;
        this.$headerImage.css('height', $(window).height() - headerPadding*2 - theme.dockedNavHeight());

        if(!this.stickyColumnsAreSticky) {
          this.$stickyColumns.stick_in_parent({
            parent: this.$stickyColumns.closest('.grid'),
            offset_top: headerPadding + theme.dockedNavHeight()
          });
          this.stickyColumnsAreSticky = true;
        }
      }
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      this.$stickyColumns.trigger('sticky_kit:detach');
      theme.peekCarousel.destroy(this.$container, this.$slideshow, this.namespace);
    }
  });

  return GetTheLook;
})();

/**
 * Promotional Images Script
 * ------------------------------------------------------------------------------
 *
 * @namespace promotional-images
 */

theme.PromotionalImages = (function() {

  function PromotionalImages(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // section
    (this.assessSection.bind(this))();
    $(window).on('load' + this.namespace, this.assessSection.bind(this));
    $(window).on('debouncedresize' + this.namespace, this.assessSection.bind(this));
  };

  PromotionalImages.prototype = $.extend({}, PromotionalImages.prototype, {

    assessSection: function(evt) {
      if($(window).width() >= 768) {
        // check all the rows
        $('.promotional-row').each(function(){
          var tallest = 0;
          $(this).find('.text_over_image .promotional-row__content').each(function(){
            var thisHeight = $(this).outerHeight() + 60;
            if(thisHeight > tallest) {
              tallest = thisHeight;
            }
          });
          $(this).find('.text_over_image').css('min-height', tallest);
        });
      } else {
        $('.promotional-row .text_over_image').css('min-height', '');
      }
    },

    onUnload: function() {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
    }
  });

  return PromotionalImages;
})();

/**
 * Featured Collection Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace featured-collection */

theme.FeaturedCollection = (function() {

  var selectors = {
    slideshow: '.js-featured-collection-slider'
  };

  var breakpoint = 768;
  var resizeTimer;

  /**
   * FeaturedCollection section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function FeaturedCollection(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    //Slideshow
    this.$slideshow = $(selectors.slideshow, this.$container);

    // peek carousel
    theme.peekCarousel.init(this.$container, this.$slideshow, this.namespace, function(){
      return $(window).width() < 768
    }, true);
  }

  FeaturedCollection.prototype = $.extend({}, FeaturedCollection.prototype, {
    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      theme.peekCarousel.destroy(this.$container, this.$slideshow, this.namespace);
    }
  });

  return FeaturedCollection;
})();

/**
 * List Collections Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the List Collections template.
 *
   * @namespace ListCollections
 */

theme.ListCollections = (function() {
  /**
   * ListCollections section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function ListCollections(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // section may contain RTE images
    theme.assessRTEImagesOnLoad(this.$container);

    /**
     * Slick ListCollections
     */
    $('.js-list-collection-slider', this.$container).each((function(index, value){
      theme.peekCarousel.init(
        this.$container,
        $(value),
        this.namespace,
        function(){ return true },
        false,
        {
          infinite: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          prevArrow: $(value).siblings('.standout-collection-slider__controls').children('.prev'),
          nextArrow: $(value).siblings('.standout-collection-slider__controls').children('.next'),
          responsive: [
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 1,
              }
            },
          ]
        }
      );
    }).bind(this));
  };

  ListCollections.prototype = $.extend({}, ListCollections.prototype, {
    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      theme.peekCarousel.destroy(this.$container, $('.js-list-collection-slider', this.$container), this.namespace);
    }
  });

  return ListCollections;
})();

/**
 * Video Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace Video
 */

theme.Video = (function() {
  /**
   * Video section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Video(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    var $iframeVideo = $(
      'iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]',
      this.$container
    );
    var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

    $iframeVideo.each(function() {
      // Add wrapper to make video responsive
      if (!$(this).parents('.video-container').length) {
        $(this).wrap('<div class="video-container"></div>');
      }
    });

    $iframeReset.each(function() {
      // Re-set the src attribute on each iframe after page load
      // for Chrome's 'incorrect iFrame content on 'back'' bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }

  Video.prototype = $.extend({}, Video.prototype, {
    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    }
  });

  return Video;
})();




/**
 * Collection Template Script
 * ------------------------------------------------------------------------------
 * For collection pages
 *
 * @namespace collection-template
 */

theme.CollectionTemplate = (function() {

  var selectors = {
    sortBy: 'select[name="sort_by"]',
    styledSelect: '.styled-dropdown select',
    filterSelects: '.filter select',
    revealFilterButtons: '.collection-filter-control button',
    closeFilterButton: '.collection-filters-container__close',
    ajaxProductsContainer: '[data-ajax-products]'
  };

  /**
   * CollectionTemplate section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function CollectionTemplate(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // change sort order
    this.$container.on('change' + this.namespace, selectors.sortBy, this.onSortByChange.bind(this));

    // filtering
    this.$filters = this.$container.find(selectors.filterSelects);
    this.$filters.on('change' + this.namespace, this.onFilterChange.bind(this));

    // revealing filters on tablet/mobile
    this.$container.on('click' + this.namespace, selectors.revealFilterButtons, this.filterReveal);
    this.$container.on('click' + this.namespace, selectors.closeFilterButton, this.filterClose);

    // style dropdowns
    theme.select2.init($(selectors.styledSelect, container));

    // ajax
    this.$ajaxProductsContainer = $(selectors.ajaxProductsContainer, container);
    if(this.$ajaxProductsContainer.data('ajax-products')) {
      $(window).on('popstate' + this.namespace, this.onWindowPopState.bind(this));
    }
  }

  CollectionTemplate.prototype = $.extend({}, CollectionTemplate.prototype, {
    /**
     * Handle back button after ajax change
     */
    onWindowPopState: function(evt) {
      if(evt.originalEvent.state == 'themeChangeUrl') {
        location.reload();
      }
    },

    /**
     * Handle ajax/not changes of url
     */
    changeUrl: function(url) {
      if(this.$ajaxProductsContainer.data('ajax-products')) {
        /// ajax
        // scroll to top of products, on mobile
        if($(window).width() <= 930) {
          $('html, body').animate({
            scrollTop: this.$ajaxProductsContainer.offset().top - 120
          }, 1000);
        }

        // transition out
        this.$ajaxProductsContainer.css({
          height: this.$ajaxProductsContainer.height(),
          opacity: 0
        });
        var _url = url;
        // wait until after transition
        var delay = this.$ajaxProductsContainer.css('transition-duration');
        if(delay.indexOf('ms') > -1) {
          delay = parseInt(delay);
        } else {
          delay = parseFloat(delay) * 1000;
        }
        setTimeout((function(){
          // fetch new
          $.get(url, (function(data){
            // get product area
            var $data = $('<div>').append($.parseHTML(data));
            var $products = $data.find(selectors.ajaxProductsContainer).children();
            // transition in
            this.$ajaxProductsContainer.empty().append($products).css({
              height: '',
              opacity: ''
            });
            // push history
            var title = $data.find('title:first').text();
            document.title = title;
            window.history.pushState('themeChangeUrl', title, _url);
          }).bind(this)).error(function(){
            window.location = _url;
          });
        }).bind(this), delay);
      } else {
        // no ajax
        window.location = url;
      }
    },

    /**
     * Event callback for when a tag filter changes
     */
    onFilterChange: function() {
      var path = this.$filters.first().data('filter-root');
      // build list of tags
      var tags = [];
      this.$filters.each(function(){
        if($(this).val().length > 0) {
          tags.push($(this).val());
        }
      });
      // add tags to collection path
      path += tags.join('+');
      // preserve sort order
      if(location.search.indexOf('sort_by') > -1) {
        var orderMatch = location.search.match(/sort_by=([^$&]*)/);
        if(orderMatch) {
          path += '?sort_by=' + orderMatch[1];
        }
      }
      this.changeUrl(path);
    },

    /**
     * Event callback for when the sort-by dropdown changes
     */
    onSortByChange: function(evt) {
      var queryParams = {};
      if (location.search.length) {
        for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
          aKeyValue = aCouples[i].split('=');
          if (aKeyValue.length > 1) {
            queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
          }
        }
      }
      queryParams.sort_by = $(evt.target).val();
      this.changeUrl(location.toString().split('?')[0] + '?' + $.param(queryParams).replace(/\+/g, '%20'));
    },

    /**
     * Function for revealing filter options
     */
    filterReveal: function() {
      var $filterContainer = $('.collection-filters-container')
        .removeClass('show-filters show-sort')
        .addClass('show-' + $(this).data('collection-filter-reveal'));

      var $controls = $('.collection-filter-control');
      var offset = $filterContainer.outerHeight() + $controls.outerHeight();
      offset += $filterContainer.offset().top - $controls.offset().top;

      $filterContainer.css('transform', 'translate3d(0,0,0)');
    },

    /**
     * Function for revealing filter options
     */
    filterClose: function() {
      $('.collection-filters-container').css('transform', '');
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      this.$filters.off(this.namespace);
      $(selectors.styledSelect, this.$container).select2('destroy');
      $(window).off(this.namespace);
    }
  });

  return CollectionTemplate;
})();

/**
 * Map Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace Map
 */

theme.Map = (function() {
  /**
   * Map section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */

  var config = {
    zoom: 14,
    styles: {
      default: [],
      silver: [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}],
      retro: [{"elementType":"geometry","stylers":[{"color":"#ebe3cd"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#523735"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f1e6"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#c9b2a6"}]},{"featureType":"administrative.land_parcel","elementType":"geometry.stroke","stylers":[{"color":"#dcd2be"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#ae9e90"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#93817c"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#a5b076"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#447530"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#f5f1e6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#fdfcf8"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#f8c967"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#e9bc62"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#e98d58"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.stroke","stylers":[{"color":"#db8555"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#806b63"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"transit.line","elementType":"labels.text.fill","stylers":[{"color":"#8f7d77"}]},{"featureType":"transit.line","elementType":"labels.text.stroke","stylers":[{"color":"#ebe3cd"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#b9d3c2"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#92998d"}]}],
      dark: [{"elementType":"geometry","stylers":[{"color":"#212121"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#212121"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#757575"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#2c2c2c"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#373737"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#3c3c3c"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#3d3d3d"}]}],
      night: [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}],
      aubergine: [{"elementType":"geometry","stylers":[{"color":"#1d2c4d"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#8ec3b9"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#1a3646"}]},{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#64779e"}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#334e87"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#023e58"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#283d6a"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#6f9ba5"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#023e58"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#3C7680"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#304a7d"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2c6675"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#255763"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#b0d5ce"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"color":"#023e58"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"transit.line","elementType":"geometry.fill","stylers":[{"color":"#283d6a"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#3a4762"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#0e1626"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#4e6d70"}]}]
    }
  };

  var errors = {
    addressNoResults: theme.strings.addressNoResults,
    addressQueryLimit: theme.strings.addressQueryLimit,
    addressError: theme.strings.addressError,
    authError: theme.strings.authError
  };

  var selectors = {
    section: '[data-section-type="map"]',
    map: '[data-map]',
    mapOverlay: '[data-map-overlay]'
  };

  var classes = {
    mapError: 'map-section--load-error',
    errorMsg: 'map-section__error errors text-center'
  };


  // Global function called by Google on auth errors.
  // Show an auto error message on all map instances.
  // eslint-disable-next-line camelcase, no-unused-vars
  window.gm_authFailure = function() {
    if (!Shopify.designMode) return;

    if (Shopify.designMode) {
      $(selectors.section).addClass(classes.mapError);
      $(selectors.map).remove();
      $(selectors.mapOverlay).after(
        '<div class="' +
          classes.errorMsg +
          '">' +
          theme.strings.authError +
          '</div>'
      );
    }
  };


  function Map(container) {

    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);
    this.$map = this.$container.find(selectors.map);
    this.key = this.$map.data('api-key');
    this.style = this.$map.data('map-style');
    this.loaded = false;

    if (this.$map.length === 0 || typeof this.key !== 'string' || this.key === '') {
      return;
    }

    $(window).on('scroll' + this.namespace + ' load' + this.namespace, this.assessVisibility.bind(this));
    this.assessVisibility.bind(this)();
  }

  function geolocate($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({ address: address }, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }


  Map.prototype = $.extend({}, Map.prototype, {

    assessVisibility: function(){
      if( this.$container !== false
          && this.$container.offset().top < $(window).scrollTop() + $(window).height()
          && this.$container.offset().top + this.$container.outerHeight() > $(window).scrollTop() ) {
        $(window).off(this.namespace);
        theme.loadScriptOnce('https://maps.googleapis.com/maps/api/js?key=' + this.key, this.createMap.bind(this));
      }
    },

    createMap: function() {
      var $map = this.$map;
      return geolocate($map)
        .then(
          function(results) {
            var mapOptions = {
              zoom: config.zoom,
              styles: config.styles[this.style],
              center: results[0].geometry.location,
              draggable: false,
              clickableIcons: false,
              scrollwheel: false,
              disableDoubleClickZoom: true,
              disableDefaultUI: true,
              zoomControl: true
            };

            var map = (this.map = new google.maps.Map($map[0], mapOptions));
            var center = (this.center = map.getCenter());

            //eslint-disable-next-line no-unused-vars
            var marker = new google.maps.Marker({
              map: map,
              position: map.getCenter()
            });

            // offset due to design
            map.panBy(0, 50);

            google.maps.event.addDomListener(window, 'resize', function() {
              google.maps.event.trigger(map, 'resize');
              map.setCenter(center);
              map.panBy(0, 50);
              $map.removeAttr('style');
            });
          }.bind(this)
        )
        .fail(function() {
          var errorMessage;

          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage = errors.addressNoResults;
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage = errors.addressQueryLimit;
              break;
            case 'REQUEST_DENIED':
              errorMessage = errors.authError;
              break;
            default:
              errorMessage = errors.addressError;
              break;
          }

          // Show errors only to merchant in the editor.
          if (Shopify.designMode) {
            $map
              .parent()
              .addClass(classes.mapError)
              .html(
                '<div class="' +
                  classes.errorMsg +
                  '">' +
                  errorMessage +
                  '</div>'
              );
          }
        });
    },

    onUnload: function() {
      if (this.$map.length === 0) {
        return;
      }
      if(window.google) {
        google.maps.event.clearListeners(this.map, 'resize');
      }
      $(window).off(this.namespace);
    }
  });
  return Map;
})();

/**
 * Instagram Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace Instagram
 */

theme.Instagram = (function() {
  /**
   * Instagram section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */

  function Instagram(container) {
    this.$container = $(container);
    this.$title = $('.title', container);

    this.loadInstagramWidgets.bind(this)();
  }

  Instagram.prototype = $.extend({}, Instagram.prototype, {
    loadInstagramWidgets: function() {
      var $title = this.$title;
      $('.willstagram:not(.willstagram-placeholder)', this.$container).each(function(){
        var user_id = $(this).data('user_id');
        var tag = $(this).data('tag');
        var access_token = $(this).data('access_token');
        var count = $(this).data('count') || 10;
        var showHover = $(this).data('show-hover');
        var $willstagram = $(this);
        var url = '';
        if(typeof user_id != 'undefined') {
          url = 'https://api.instagram.com/v1/users/' + user_id + '/media/recent?count='+count;
        } else if(typeof tag != 'undefined') {
          url = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?count='+count;
        }
        $.ajax({
          type: "GET",
          dataType: "jsonp",
          cache: false,
          url: url
          + (typeof access_token == 'undefined'? '' : ('&access_token='+access_token)),
          success: function(res) {
            if(typeof res.data != 'undefined') {
              var $itemContainer = $('<div class="willstagram__items">').appendTo($willstagram);
              var limit = Math.min(20, res.data.length);
              for(var i = 0; i < limit; i++) {
                var photo = res.data[i].images.standard_resolution;
                var photo_small = res.data[i].images.low_resolution;
                var $item = $([
                  '<div class="willstagram__item global-border-radius item--', i+1,
                  '"><a class="willstagram__link rimage-background lazyload fade-in" target="_blank" href="',
                  res.data[i].link,
                  '" data-bgset="', photo_small.url.replace('http:', ''),' ', photo_small.width, 'w ', photo_small.height, 'h, ',
                  photo.url.replace('http:', ''), ' ', photo.width, 'w ', photo.height, 'h" data-sizes="auto" data-parent-fit="cover">',
                  '<img class="willstagram__img lazyload fade-in" data-src="',
                  photo.url.replace('http:', ''),
                  '" /></a></div>'
                ].join(''));

                if(showHover) {
                  var date = new Date(res.data[i].created_time * 1000);
                  window.willstagramMaskCount = (window.willstagramMaskCount || 0) + 1;
                  var maskId = 'willstagram-svg-mask-' + window.willstagramMaskCount,
                      gradientId = 'willstagram-svg-grad-' + window.willstagramMaskCount;
                  $item.append([
                    '<div class="willstagram__overlay">',
                    '<div class="willstagram__desc">',
                    '<svg>',
                      '<defs>',
                        '<mask id="', maskId, '" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">',
                          '<linearGradient id="', gradientId, '" gradientUnits="objectBoundingBox" x2="0" y2="1">',
                            '<stop stop-color="white" stop-opacity="1" offset="0" />',
                            '<stop stop-color="white" stop-opacity="1" offset="0.6" />',
                            '<stop stop-color="white" stop-opacity="0" offset="1" />',
                          '</linearGradient>',
                          '<rect width="100%" height="100%" fill="url(#', gradientId, ')" />',
                        '</mask>',
                      '</defs>',
                      '<foreignObject width="100%" height="500" style="mask: url(#', maskId,')">',
                        '<div xmlns="http://www.w3.org/1999/xhtml">',
                          res.data[i].caption ? res.data[i].caption.text : '',
                        '</div>',
                      '</foreignObject>',
                    '</svg>',
                    '</div>',
                    '<div class="willstagram__likes">', res.data[i].likes ? ('❤ ' + res.data[i].likes.count) : '', '</div>',
                    '<div class="willstagram__date">', date.toLocaleDateString(), '</div>',
                    '</div>'
                  ].join(''));
                }
                $itemContainer.append($item);
              }

              $willstagram.trigger('loaded.willstagram');
              if(res.data.length > 0 && $title.length) {
                var username = res.data[0].user.username;
                var title_html = $title.html();
                $title.html($('<a target="_blank">').attr('href', 'https://instagram.com/'+username).html(title_html));
              }
            } else if(typeof res.meta !== 'undefined' && typeof res.meta.error_message !== 'undefined') {
              $willstagram.append('<div class="willstagram__error">'+res.meta.error_message+'</div>');
            }
          }
        });
      });

      $('.willstagram-placeholder', this.$container).trigger('loaded.willstagram');
    }
  });
  return Instagram;
})();

/**
 * Cart Template Script
 * ------------------------------------------------------------------------------
 *
   * @namespace cart
 */

 theme.Cart = (function() {
  /**
   * Cart section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Cart(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // toggle shipping estimates
    this.$container.on('click' + this.namespace, '.js-shipping-calculator-trigger', function(){
      var $this = $(this);
      var $parent = $this.parents('.shipping-calculator-container');
      $parent.toggleClass('calculator-open');
      if($parent.hasClass('calculator-open')){
        $this.text("Nascondi il calcolo di spedizione.");
        $parent.children('.shipping-calculator').slideDown(250);
      } else {
        $this.text("Stima il costo di spedizione");
        $parent.children('.shipping-calculator').slideUp(250);
      }
    });

    // toggle notes
    this.$container.on('click' + this.namespace, '.js-cart-notes-trigger', function(){
      var $this = $(this);
      var $parent = $this.parent('.cart-notes-container');
      $parent.toggleClass('notes-open');
      if($parent.hasClass('notes-open')){
        $this.text("Nascondi istruzioni per il venditore");
        $parent.children('.cart-notes').slideDown(250);
      } else {
        $this.text("Aggiungi istruzioni per il venditore");
        $parent.children('.cart-notes').slideUp(250);
      }
    });

    // quantity adjustment
    if(this.$container.data('ajax-update')) {
      var updateCartFunction = this.updateCart;
      this.$container.on('keyup' + this.namespace + ' change' + this.namespace, '.quantity__change input', function(){
        if($(this).data('previousValue') && $(this).data('previousValue') == $(this).val()){
          return;
        }
        if($(this).val().length == 0 || $(this).val() == '0') {
          return;
        }
        updateCartFunction({
          line: $(this).data('line'),
          quantity: $(this).val()
        });
        $(this).data('previousValue', $(this).val());
      });

      this.$container.on('click' + this.namespace, '.quantity__minus, .quantity__plus', function(e){
        var $input = $(this).closest('.quantity__change').find('input');
        if($(this).hasClass('quantity__minus')) {
          $input.val(parseInt($input.val()) - 1).trigger('change');
        } else {
          $input.val(parseInt($input.val()) + 1).trigger('change');
        }
        return false;
      });
    }

    // select contents on focus
    this.$container.on('focusin' + this.namespace + ' click' + this.namespace, 'input.quantity__number', function(){
      $(this).select();
    }).on('mouseup' + this.namespace, 'input.quantity__number', function(e){
      e.preventDefault(); //Prevent mouseup killing select()
    });

    // terms and conditions checkbox
    if($('#terms', container).length > 0) {
      $(document).on('click' + this.namespace, '[name="checkout"], a[href="/checkout"]', function() {
        if($('#terms:checked').length == 0) {
          alert(theme.strings.cartTermsNotChecked);
          return false;
        }
      });
    }

    // recently viewed
    this.$recentlyViewed = $('.recently-viewed', this.$container);
    if(this.$recentlyViewed.length) {
      this.loadRecentlyViewed.bind(this)();
      theme.loadRecentlyViewed(this.$recentlyViewed);
    }
  }


  Cart.prototype = $.extend({}, Cart.prototype, {
    /**
     * Display recently viewed products, minus products in the cart
     */
    loadRecentlyViewed: function(evt) {
      if(theme.storageAvailable('localStorage')) {
        // grab current value and parse
        var recentDisplayCount = 6;
        var existingArr = theme.getRecentProducts();

        if(existingArr.length) {
          // remove in-cart items from row
          var handlesToExcludeValue = this.$recentlyViewed.data('exclude');
          var handlesToExclude = [];
          if(handlesToExcludeValue.length) {
            handlesToExclude = handlesToExcludeValue.split(',');
          }

          // show the products
          var $recentlyViewedBucket = this.$recentlyViewed.find('.grid'),
              count = 0,
              iterator = 0,
              showHoverImage = this.$recentlyViewed.data('show-hover-image');

          while(count < recentDisplayCount && iterator < existingArr.length) {
            var showThis = true;
            // skip those in the excluded-list
            for(var i=0; i<handlesToExclude.length; i++) {
              if(existingArr[iterator].handle == handlesToExclude[i]) {
                showThis = false;
                break;
              }
            }
            if(showThis) {
              count++;
              theme.addRecentProduct(existingArr, iterator, $recentlyViewedBucket, showHoverImage);
            }
            iterator++;
          }

          // reveal container, if anything to show
          if(count > 0) {
            this.$recentlyViewed.removeClass('hidden');
          }
        }
      }
    },

    /**
     * Function for changing the cart and updating the page
     */
    updateCart: function(params){
      if(window.cartXhr) {
        window.cartXhr.abort();
      }
      window.cartXhr = $.ajax({
        type: 'POST',
        url: '/cart/change.js',
        data: params,
        dataType: 'json',
        success: function(data){
          // subtotal
          $('.total__amount').html(
            $('<span class="theme-money">').html(slate.Currency.formatMoney(data.total_price, theme.moneyFormat))
          );

          // each line item
          $('.cart-item .total[data-line]').each(function(){
            // line price
            var linePrice = data.items[$(this).data('line') - 1].line_price;
            $(this).html(
              $('<span class="theme-money">').html(slate.Currency.formatMoney(linePrice, theme.moneyFormat))
            );

            // minus visibility
            var quantity = data.items[$(this).data('line') - 1].quantity;
            var $item = $(this).closest('.cart-item');
            $item.find('.quantity__minus').toggleClass('quantity__unusable', quantity < 2);
            var $input = $item.find('input');
            if($input.val() != quantity.toString()) {
              $input.val(quantity).data('previousValue', quantity.toString());
              alert(theme.strings.quantityTooHigh.replace(['{', '{ quantity }', '}'].join(''), quantity));
            }

            // plus visibility
            if($input.data('max') !== 'undefined' && $input.val() == $input.data('max')) {
              $item.find('.quantity__plus').addClass('quantity__unusable');
            } else {
              $item.find('.quantity__plus').removeClass('quantity__unusable');
            }
          });
          
          if(typeof BOLD === 'object' && BOLD.common && BOLD.common.eventEmitter && typeof BOLD.common.eventEmitter.emit === 'function') {
            BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded");
            BOLD.common.eventEmitter.emit('BOLD_COMMON_redirect_upsell_product');
          }

          theme.checkCurrency();
        },
        error: function(data){
          console.log('Error processing update');
          console.log(data);
        }
      });
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
      $(document).off(this.namespace);
      if(this.$recentlyViewed.length) {
        theme.unloadRecentlyViewed(this.$recentlyViewed);
      }
    }
  });

  return Cart;
})();

/**
 * Page Story Template Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace featured-collection */

theme.PageStoryTemplate = (function() {

  var selectors = {
    collectionSlideshow: '.js-collection-slider'
  };

  /**
   * PageStoryTemplate section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function PageStoryTemplate(container) {
    this.$container = $(container);
    this.namespace = theme.namespaceFromSection(container);

    // section may contain RTE images
    theme.assessRTEImagesOnLoad(this.$container);

    // Slideshows
    this.$slideshows = $(selectors.collectionSlideshow, this.$container);

    // peek carousel
    theme.peekCarousel.init(this.$container, this.$slideshows, this.namespace, function(){
      return $(window).width() < 768
    }, true);

    // Image with text rows
    this.$imageWithTextRows = $('.image-with-text', container);

    // Section
    this.assessSection.bind(this)();
    $(window).on('debouncedresize' + this.namespace, this.assessSection.bind(this));
  }

  PageStoryTemplate.prototype = $.extend({}, PageStoryTemplate.prototype, {

    /**
     * Set/unset slideshows
     */
    assessSection: function(evt) {
      // mimic logic from image-with-text.js
      this.$imageWithTextRows.each(function(){
        // assign
        var $imageWithTextImageContainer = $('.image-with-text__image', this);
        var $imageWithTextImage = $('.image-with-text__image .rimage__image', this);
        var $imageWithTextText = $('.image-with-text__content', this);
        // calculate
        var imageRatio = $imageWithTextImage.height() / $imageWithTextImage.width();
        var imageHeightWithoutInset = $imageWithTextImageContainer.outerWidth() * imageRatio;
        $imageWithTextImageContainer.toggleClass(
          'image-with-text__image--inset',
          imageHeightWithoutInset < $imageWithTextText.outerHeight()
        );
      });
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      $(window).off(this.namespace);
      theme.peekCarousel.destroy(this.$container, this.$slideshows, this.namespace);
    }
  });

  return PageStoryTemplate;
})();

/**
 * ImageWithText Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace ImageWithText
 */

theme.ImageWithText = (function() {
  /**
   * ImageWithText section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */

  function ImageWithText(container) {
    this.namespace = theme.namespaceFromSection(container);
    this.$container = $(container);
    this.$imageContainer = $('.image-with-text__image', container);
    this.$image = $('.image-with-text__image .rimage__image', container);
    this.$text = $('.image-with-text__content', container);

    $(window).on('load' + this.namespace + ' debouncedresize' + this.namespace, this.assessImage.bind(this));
    this.assessImage.bind(this)();
  }

  ImageWithText.prototype = $.extend({}, ImageWithText.prototype, {

    /**
     * Ensure image either fills height or is inset
     */
    assessImage: function(evt) {
      var imageRatio = this.$image.height() / this.$image.width();
      var imageHeightWithoutInset = this.$imageContainer.outerWidth() * imageRatio;
      this.$imageContainer.toggleClass(
        'image-with-text__image--inset',
        imageHeightWithoutInset < this.$text.outerHeight()
      );
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      $(window).off(this.namespace);
    }
  });
  return ImageWithText;
})();

/**
 * FeaturedProduct Section Script
 * ------------------------------------------------------------------------------
 *
 * @namespace FeaturedProduct
 */

theme.FeaturedProduct = (function() {
  /**
   * FeaturedProduct section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */

  function FeaturedProduct(container) {
    this.namespace = theme.namespaceFromSection(container);
    this.$container = $(container);
    this.$row = $('.featured-product-section', container);
    this.$imageContainer = $('.featured-product-image', container);
    this.$image = $('.featured-product-image .featured-product-image-link', container);

    $(window).on('load' + this.namespace + ' debouncedresize' + this.namespace, this.assessImage.bind(this));
    this.assessImage.bind(this)();
  }

  FeaturedProduct.prototype = $.extend({}, FeaturedProduct.prototype, {

    /**
     * Ensure image either fills height or is inset
     */
    assessImage: function(evt) {
      var imageRatio = this.$image.height() / this.$image.width();
      var imageHeightWithoutInset = this.$imageContainer.outerWidth() * imageRatio;
      this.$imageContainer.toggleClass(
        'featured-product-image--inset',
        imageHeightWithoutInset < this.$row.height()
      );
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      $(window).off(this.namespace);
    }
  });
  return FeaturedProduct;
})();



/*================ Templates ================*/
/**
 * Customer Addresses Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Customer Addresses
 * template.
 *
 * @namespace customerAddresses
 */

theme._initCustomerAddressCountryDropdown = function(){
  // Initialize each edit form's country/province selector
  new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
    hideElement: 'AddressProvinceContainerNew'
  });

  if($('#AddressCountryNew-modal').length) {
    new Shopify.CountryProvinceSelector('AddressCountryNew-modal', 'AddressProvinceNew-modal', {
      hideElement: 'AddressProvinceContainerNew-modal'
    });
  }

  $('.address-country-option').each(function() {
    var formId = $(this).data('form-id');
    var countrySelector = 'AddressCountry_' + formId;
    var provinceSelector = 'AddressProvince_' + formId;
    var containerSelector = 'AddressProvinceContainer_' + formId;

    new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
      hideElement: containerSelector
    });
  });
};

theme._setupCustomAddressModal = function(){
  var suffix = '-modal';
  $('.lightbox-content form, .lightbox-content input[id], .lightbox-content select[id], .lightbox-content div[id]').each(function(){
    $(this).attr('id', $(this).attr('id') + suffix);
  });
  $('.lightbox-content label[for]').each(function(){
    $(this).attr('for', $(this).attr('for') + suffix);
  });
  $('.lightbox-content .address-country-option').each(function(){
    var formId = $(this).data('form-id') + suffix;
    $(this).attr('data-form-id', formId).data('form-id', formId);
  });
  theme._initCustomerAddressCountryDropdown();
};

theme.customerAddresses = (function() {
  var $newAddressForm = $('#AddressNewForm');

  if (!$newAddressForm.length) {
    return;
  }

  // Initialize observers on address selectors, defined in shopify_common.js
  if (Shopify) {
    theme._initCustomerAddressCountryDropdown();
  }

  // Toggle new/edit address forms
  $('.address-new-toggle').on('click', function() {
    $.colorbox({
      transition: 'fade',
      html: '<div class="lightbox-content">' + $newAddressForm.html() + '</div>',
      onComplete: theme._setupCustomAddressModal
    });
    return false;
  });

  $('.address-edit-toggle').on('click', function() {
    var formId = $(this).data('form-id');
    $.colorbox({
      transition: 'fade',
      html: '<div class="lightbox-content">' + $('#EditAddress_' + formId).html() + '</div>',
      onComplete: theme._setupCustomAddressModal
    });
    return false;
  });

  $('.address-delete').on('click', function() {
    var $el = $(this);
    var formId = $el.data('form-id');
    var confirmMessage = $el.data('confirm-message');
    if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
      Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
    }
  });

  // show lightbox if error inside
  if($('#AddressNewForm .errors').length) {
    $('.address-new-toggle').click();
  }
  if($('.grid .address-card .errors').length) {
    $('.grid .address-card .errors').first().closest('.address-card').find('.address-edit-toggle').click();
  }
})();

/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Password template.
 *
 * @namespace password
 */

theme.customerLogin = (function() {
  var selectors = {
    recoverPasswordForm: '#RecoverPassword',
    hideRecoverPasswordLink: '#HideRecoverPasswordLink'
  };

  $(document).on('click', selectors.recoverPasswordForm, onShowHidePasswordForm);
  $(document).on('click', selectors.hideRecoverPasswordLink, onShowHidePasswordForm);


  function onShowHidePasswordForm(evt) {
    evt.preventDefault();
    toggleRecoverPasswordForm($(this).closest('.container'));
  }

  /**
   *  Show/Hide recover password form
   */
  function toggleRecoverPasswordForm(container) {
    $('[id=RecoverPasswordForm]', container).toggleClass('hide');
    $('[id=CustomerLoginForm]', container).toggleClass('hide');
  }

  // if on login page, check for past form submission
  if ($(selectors.recoverPasswordForm).length) {
    checkUrlHash();
    resetPasswordSuccess();

    function checkUrlHash() {
      var hash = window.location.hash;

      // Allow deep linking to recover password form
      if (hash === '#recover') {
        toggleRecoverPasswordForm(null);
      }
    }

    /**
     *  Show reset password success message
     */
    function resetPasswordSuccess() {
      var $formState = $('.reset-password-success');

      // check if reset password form was successfully submited.
      if (!$formState.length) {
        return;
      }

      // show success message
      $('#ResetSuccess').removeClass('hide');
    }
  }
})();



theme.icons = {
  close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
};

theme.checkCurrency = function(){
  if(window.Currency && Currency.convertAll) {
    // set initial value for uninitialised prices
    $('.theme-money:not([data-currency-'+theme.Currency.shopCurrency+'])').each(function() {
      $(this).attr('data-currency-'+theme.Currency.shopCurrency, $(this).html());
    });
    // convert all
    Currency.convertAll(theme.Currency.shopCurrency, jQuery('[name=currencies]').val(), Currency.currencyContainer);
  }
}

theme.openPageContentInLightbox = function(url) {
  $.get(url, function(data){
    var $content = $('#MainContent', $.parseHTML('<div>'+data+'</div>'));
    $.colorbox({
      transition: 'fade',
      html: '<div class="lightbox-content">' + $content.html() + '</div>',
      onComplete: function(){
        // check any new inputs
        $('#cboxContent .input-wrapper input').trigger('inputstateEmpty');
        $('#cboxContent input[data-desktop-autofocus]').focus();
        if(window.location.href.includes('au-membership') || window.location.href.includes('membership-pannello-utente')) {
          $('#cboxContent').find('form[action="/account/login"]').append('<input type="hidden" name="checkout_url" value="/pages/membership-pannello-utente" />')
        }
        else if(window.location.href.includes('invita-un-amico') || window.location.href.includes('sconto-american-uncle')) {
          $('#cboxContent').find('form[action="/account/login"]').append('<input type="hidden" name="checkout_url" value="/pages/invita-un-amico" />')
        }
      }
    });
  });
};

theme.styleVariantSelectors = function($els, data, inLightbox){
  var $clickies = $els.filter(function(){
    return typeof $(this).data('listed') != 'undefined'
  });

  $clickies.each(function(){
    // list options out, bound to the original dropdown
    $(this).clickyBoxes();

    // change swatch label on hover
    var $label = $(this).closest('.selector-wrapper').find('.variant-option-title');
    if($label.length) {
      $label.data('default-content', $label.html());
      $(this).siblings('.clickyboxes').on('change', function() {
        $label.data('default-content', $(this).find('a.active').data('value'));
      }).on('mouseenter', 'a', function(){
        $label.html($(this).data('value'));
      }).on('mouseleave', 'a', function(){
        $label.html($label.data('default-content'));
      });
    }
  });

  // If we have clicky-boxes, add the disabled-state to options that have no valid variants
  if($clickies.length > 0) {
    // each option
    for(var optionIndex = 0; optionIndex < data.options.length; optionIndex++) {
      // list each value for this option
      var optionValues = {};
      for(var variantIndex = 0; variantIndex < data.variants.length; variantIndex++) {
        var variant = data.variants[variantIndex];
        if(typeof optionValues[variant.options[optionIndex]] === 'undefined') {
          optionValues[variant.options[optionIndex]] = false;
        }
        // mark true if an option is available
        if(variant.available) {
          optionValues[variant.options[optionIndex]] = true;
        }
      }
      // mark any completely unavailable options
      for(var key in optionValues) {
        if(!optionValues[key]) {
          $($els[optionIndex]).siblings('.clickyboxes').find('li a').filter(function(){
            return $(this).data('value') == key;
          }).addClass('unavailable');
        }
      }
    }
  }

  // dropdowns
  $els.not($clickies).each(function(){
    // apply select2 to dropdown
    var config = {};
    if(inLightbox) {
      config.dropdownParent = $('#cboxWrapper');
    }
    theme.select2.init($(this), config);
  });
  if(inLightbox) {
    $.colorbox.resize();
  }
}

theme.select2 = {
  init: function($els, config){
    var standardSelectOptions = {
      minimumResultsForSearch: Infinity
    };
    var swatchSelectOptions = {
      minimumResultsForSearch: Infinity,
      templateResult: theme.select2.swatchSelect2OptionTemplate,
      templateSelection: theme.select2.swatchSelect2OptionTemplate
    };
    if(typeof config !== 'undefined') {
      standardSelectOptions = $.extend(standardSelectOptions, config);
      swatchSelectOptions = $.extend(swatchSelectOptions, config);
    }
    $els.each(function(){
      $(this).select2($(this).data('colour-swatch') ? swatchSelectOptions : standardSelectOptions);
    });
  },
  swatchSelect2OptionTemplate: function(state) {
    if (state.id) {
      var colourKey = state.id.toLowerCase().replace(/[^a-z0-9]+/g, '');
      return $([
        '<div class="swatch-option">',
        '<span class="swatch-option__nugget bg-', colourKey, '"></span>',
        '<span class="swatch-option__label">', state.text, '</span>',
        '</div>'
      ].join(''));
    } else {
      return $([
        '<div class="swatch-option swatch-option--all">',
        '<span class="swatch-option__label">', state.text, '</span>',
        '</div>'
      ].join(''));
    }
  }
};

theme.namespaceFromSection = function(container) {
  return ['.', $(container).data('section-type'), $(container).data('section-id')].join('');
}

// global helpers for the docked nav
theme.dockedNavDesktopMinWidth = 768;
theme.dockedNavHeight = function() {
  if($(window).width() >= theme.dockedNavDesktopMinWidth) {
    if($('.docked-navigation-container').length) {
      return $('.docked-navigation-container__inner').height();
    }
  } else {
    if($('.docked-mobile-navigation-container').length) {
      return $('.docked-mobile-navigation-container__inner').height();
    }
  }
  return 0;
}

/// Show a short-lived text popup above an element
theme.showQuickPopup = function(message, $origin){
  var $popup = $('<div class="simple-popup"/>');
  var offs = $origin.offset();
  $popup.html(message).css({ left: offs.left, top: offs.top }).hide();
  $('body').append($popup);
  $popup.css({ marginTop: - $popup.outerHeight() - 10, marginLeft: -($popup.outerWidth()-$origin.outerWidth())/2});
  $popup.fadeIn(200).delay(3500).fadeOut(400, function(){
    $(this).remove();
  });
}

// Calculate accent colour height
theme.resizeAccent = function(){
  var accentHeight = 0;
  var $firstSection = $('.accent-background').next();

  if($firstSection.length) {
    var $marginTop = parseInt($firstSection.css('margin-top'));

    if($firstSection.find('.sticky-element').length){
      accentHeight = Math.round(($firstSection.find('.sticky-element').outerHeight() / 2) + $marginTop);
    } else {
      accentHeight = Math.round(($firstSection.outerHeight() / 2) + $marginTop);
    }
    $('.accent-background').css('height', accentHeight);
  } else{
    accentHeight = '';
  }
  $('.accent-background').css('height', accentHeight);
}

// peeking carousels UI
theme.peekCarousel = {
  init: function($container, $slideshows, globalNamespace, useCarouselCheckFn, removeClasses, slickConfig) {
    theme.peekCarousel._checkAdvice($container);

    var data = {
      $slideshows: $slideshows,
      useCarouselCheckFn: useCarouselCheckFn,
      removeClasses: removeClasses,
      slickConfig: typeof(slickConfig) == 'object' ? slickConfig : {
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipeToSlide: true,
        dots: false,
        arrows: false
      }
    };

    theme.peekCarousel._assess.bind(data)();
    $(window).on('debouncedresize' + globalNamespace, theme.peekCarousel._assess.bind(data));

    $('.product-carousel-peek__advice', $container).on('click', function(){
      $(this).closest('.product-carousel-peek').find('.slick-initialized').slick('slickNext').trigger('dismissAdvice');
    });
  },

  destroy: function($container, $slideshows, globalNamespace) {
    if($slideshows.hasClass('slick-initialized')){
      $slideshows.slick('unslick').off('swipe dismissAdvice');
    }
    $(window).off('debouncedresize' + globalNamespace, theme.peekCarousel._assess);
    $('.product-carousel-peek__advice', $container).off('click');
  },

  _assess: function(){
    for(var i=0; i<this.$slideshows.length; i++) {
      var $slideshow = $(this.$slideshows[i]);

      if(this.useCarouselCheckFn()) {
        if(!$slideshow.hasClass('slick-initialized')){
          // stow away the original classes
          if(this.removeClasses) {
            $slideshow.children().each(function(){
              $(this).data('peekOriginalClassName', this.className);
              this.className = '';
            });
          }

          // note when singular or empty
          if($slideshow.children().length == 0) {
            $slideshow.closest('.product-carousel-peek').addClass('product-carousel-peek--empty');
          }
          if($slideshow.children().length == 1) {
            $slideshow.closest('.product-carousel-peek').addClass('product-carousel-peek--single');
          }

          // turn into slideshow
          $slideshow.slick(this.slickConfig).on('swipe dismissAdvice', theme.peekCarousel._dismissAdviceOnSlickSwipe);
        }
      } else {
        if($slideshow.hasClass('slick-initialized')){
          // destroy slideshow
          $slideshow.slick('unslick').off('swipe dismissAdvice');

          // restore original class names
          if(this.removeClasses) {
            $slideshow.children().each(function(){
              this.className = $(this).data('peekOriginalClassName');
            });
          }
        };
      }
    }
  },

  _checkAdvice: function(container) {
    if($.cookie('theme.boost.dismissPeekAdvice') != '1') {
      $('.product-carousel-peek', container).addClass('product-carousel-peek--show-advice');
    }
  },

  _dismissAdvice: function() {
    $.cookie('theme.boost.dismissPeekAdvice', '1', { expires: 7, path: '/', domain: window.location.hostname });
    $('.product-carousel-peek').addClass('product-carousel-peek--dismiss-advice');
  },

  _dismissAdviceOnSlickSwipe: function(evt, slick) {
    theme.peekCarousel._dismissAdvice();
    $(this).off('swipe');
  }
};

$(document).ready(function() {
  var sections = new slate.Sections();
  sections.register('header', theme.Header);
  sections.register('footer', theme.Footer);
  sections.register('product', theme.Product);
  sections.register('blog', theme.Blog);
  sections.register('article', theme.Article);
  sections.register('slideshow', theme.Slideshow);
  sections.register('standout-collection', theme.StandoutCollection);
  sections.register('get-the-look', theme.GetTheLook);
  sections.register('promotional-images', theme.PromotionalImages);
  sections.register('featured-collection', theme.FeaturedCollection);
  sections.register('list-collections', theme.ListCollections);
  sections.register('video', theme.Video);
  sections.register('collection-template', theme.CollectionTemplate);
  sections.register('map', theme.Map);
  sections.register('instagram', theme.Instagram);
  sections.register('cart', theme.Cart);
  sections.register('page-story-template', theme.PageStoryTemplate);
  sections.register('image-with-text', theme.ImageWithText);
  sections.register('featured-product', theme.FeaturedProduct);

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  // Target tables to make them scrollable
  var tableSelectors = '.rte table';

  slate.rte.wrapTable({
    $tables: $(tableSelectors),
    tableWrapperClass: 'rte__table-wrapper',
  });

  // Target iframes to make them responsive
  var iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"],' +
    '.rte iframe[src*="player.vimeo"]';

  slate.rte.wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'rte__video-wrapper'
  });

  // Apply a specific class to the html element for browser support of cookies.
  if (slate.cart.cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }

  // Input state: empty
  $(document).on('change focusout inputstateEmpty', '.input-wrapper input, .input-wrapper textarea', function() {
    $(this).closest('.input-wrapper').toggleClass('is-empty', $(this).val().length == 0);
  });

  // Input state: focus
  $(document).on('focusin focusout', '.input-wrapper input, .input-wrapper textarea', function(evt) {
    $(this).closest('.input-wrapper').toggleClass('in-focus', evt.type == 'focusin');
  });

  // Input state: check on section load
  $(document).on('shopify:section:load', function(){
    $('.input-wrapper input, .input-wrapper textarea').trigger('inputstateEmpty');
  });

  // Input state: html5 autofocus - focussed before dom ready
  $('.input-wrapper input:focus, .input-wrapper textarea:focus').closest('.input-wrapper').addClass('in-focus');

  // Input state: check empty now
  $('.input-wrapper input, .input-wrapper textarea').trigger('inputstateEmpty');

  $('.input-wrapper input, .input-wrapper textarea').on('animationstart', function(e){
    if(e.originalEvent.animationName == 'onAutoFillStart') {
      $(this).closest('.input-wrapper').removeClass('is-empty');
    } else if(e.originalEvent.animationName == 'onAutoFillCancel') {
      $(this).trigger('inputstateEmpty');
    }
  });

  // focus on some inputs on page load, on desktop
  if($(window).width() > 1024) {
    $('input[data-desktop-autofocus]').focus();
  }

  // Transition scroll to in-page links (listener must be set before any other link-clicking events)
  $(document).on('click', 'a[href^="#"]:not([href="#"])', function(){
    var $target = $($(this).attr('href')).first();
    if($target.length == 1) {
      $('html:not(:animated),body:not(:animated)').animate({
        scrollTop: $target.offset().top
      }, 600);
    }
    return false;
  });

  // Tabs
  $(document).on('click assess', '.tabs a', function(evt){
    // active class
    $(this).addClass('tab--active').closest('ul').find('.tab--active').not(this).removeClass('tab--active');
    // hide inactive content
    $(this).closest('li').siblings().find('a').each(function(){
      $($(this).attr('href')).removeClass('tab-content--active');
    });
    // show active content
    $($(this).attr('href')).addClass('tab-content--active');
    evt.preventDefault();
  });

  $(document).on('ready shopify:section:load', function(){
    $('.tabs:not(:has(.tab--active)) a:first').trigger('assess');
  });

  /// Quickbuy with colorbox and slick
  var activeQuickBuyRequest = null;
  var breakpoint = 768;

  $(document).on('click', '.js-contains-quickbuy .js-quickbuy-button', function(e){
    if($(window).width() > breakpoint) {

      if (activeQuickBuyRequest) {
        return false;
      }

      var $prod = $(this).closest('.js-contains-quickbuy');
      var placeholder = $prod.find('.quickbuy-placeholder-template').html();
      var $template = $('<div class="quickbuy">'+placeholder+'</div>');

      // observer for dynamic payment buttons
      var buttonObserved = false;
      var buttonObserver = new MutationObserver(function(mutations){
        $.colorbox.resize();
      });

      $.colorbox({
        closeButton: false,
        preloading: false,
        open: true,
        speed: 200,
        slideshow: true,
        //transition: "none",
        html: [$template.wrap('<div>').parent().html()].join(''),
        onComplete: function(){
          $('.quickbuy__product-images').slick({
            infinite: false,
            slidesToScroll: 1,
            speed: 300,
            slidesToShow: 1,
            swipeToSlide: true,
            variableWidth: true,
            prevArrow: $('.quickbuy__slider-controls .prev'),
            nextArrow: $('.quickbuy__slider-controls .next')
          })
          $.colorbox.resize();

          // initialise variants
          var $container = $('.quickbuy-form');
          var productData = JSON.parse($('[data-product-json]', $prod).html());
          var options = {
            $container: $container,
            enableHistoryState: false,
            singleOptionSelector: '[data-single-option-selector]',
            originalSelectorId: '[data-product-select]',
            product: productData, // for slate
            productSingleObject: productData // for our callbacks
          };
          var variants = new slate.Variants(options);
          $container.on('variantChange', theme.variants.updateAddToCartState.bind(options));
          $container.on('variantPriceChange', theme.variants.updateProductPrices.bind(options));
          if($('.quickbuy__product-images .image', $container).length > 1) {
            $container.on('variantImageChange', function(evt){
              var variant = evt.variant;
              var matchSrc = variant.featured_image.src.split('?')[0].replace('https:', '');
              var $found = $('.quickbuy__product-images .slick-slide:not(.slick-cloned) .image[data-original-src^="' + matchSrc + '"]', $container);
              if($found.length) {
                var slickIndex = $found.closest('.slick-slide').data('slick-index');
                $found.closest('.slick-slider').slick('slickGoTo', slickIndex);
              }
            });
          }
          // resize lightbox after callbacks may have altered the page
          $container.on('variantChange', $.colorbox.resize);

          // style dropdowns
          theme.styleVariantSelectors($('.quickbuy .selector-wrapper select'), options.product, true);

          // load extra payment buttons
          if (Shopify.PaymentButton) {
            $(document).on('shopify:payment_button:loaded.themeQuickBuy', function(){
              $(document).off('shopify:payment_button:loaded.themeQuickBuy');
              $.colorbox.resize();

              // attach a MutationObserver
              buttonObserved = $('.quickbuy-form .shopify-payment-button')[0];
              if(buttonObserved) {
                buttonObserver.observe(buttonObserved, { attributes: true, childList: true, subtree: true });
              }
            });
            Shopify.PaymentButton.init();
          }

          // currency converter
          theme.checkCurrency();

          // add to recent products
          theme.addToAndReturnRecentProducts(
            productData.handle,
            productData.title,
            productData.available,
            productData.images[0],
            productData.images.length > 1 ? productData.images[1] : null,
            productData.price,
            productData.price_varies,
            productData.compare_at_price
          );
        },
        onCleanup: function(){
          $('.quickbuy-form').off('variantChange variantPriceChange variantImageChange');
          buttonObserver.disconnect();
        }
      });

      // e.stopImmediatePropagation();
      return false;
    }
  });

  $(document).on('click', '#colorbox .quickbuy__close .js-close-quickbuy', function(){
    $.colorbox.close();
    return false;
  });

  // general purpose 'close a lightbox' link
  $(document).on('click', '.js-close-lightbox', function(){
    $.colorbox.close();
    return false;
  });

  // quantity wrapper
  $(document).on('change', '.quantity-proxy', function(){
    var value = $(this).val();
    var $input = $(this).siblings('[name="quantity"]');
    if(value == '10+') {
      $input.val('10').closest('.quantity-wrapper').addClass('hide-proxy');
      setTimeout(function(){
        $input.select().focus();
      }, 10);
    } else {
      $input.val(value);
    }
  });

  // newsletter success message shows in lightbox
  var $newsletterSuccess = $('.subscribe-form__response--success');
  if($newsletterSuccess.length) {
    $.colorbox({
      transition: 'fade',
      html: '<div class="subscribe-form-lightbox-response">' + $newsletterSuccess.html() + '</div>',
      onOpen: function(){
        $('#colorbox').css('opacity', 0);
      },
      onComplete: function(){
        $('#colorbox').animate({ 'opacity': 1 }, 350);
      }
    });
  }

  $('.product-detail__featured-image').slick({
    draggable: false,
    speed: 0,
    arrows: false,
  });

  $('.product-detail__thumbnail').on('click', function() {
    let index = $(this).attr('data-index');
    $('.product-detail__featured-image').slick('slickGoTo', index);
  })

  // resize height of accent colour on homepage
  if($('.accent-background').length) {
    // run now, and after fonts are loaded, then on resize
    theme.resizeAccent();
    $(window).on('load debouncedresize', theme.resizeAccent);

    // run when the section at the top loads
    $(document).on('shopify:section:load', function(evt){
      if($(evt.target).prev().hasClass('accent-background')) {
        theme.resizeAccent();
      }
    });

    // a section may have moved to/away from the top
    $(document).on('shopify:section:reorder', theme.resizeAccent);
  }

}); // end of main $(document).ready()



})(theme.jQuery);



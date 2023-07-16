// Because this file might be being used by CeB who won't have all the other JavaScript
if (typeof Fis === 'undefined')
	Fis = function () { };

(function ($) {
	'use strict';

	Fis.VisualValidator = function () { };
	Fis.VisualValidator.secretCodeConfig = {
		minCharacters: 1,												// The minimum number of characters that must be entered
		maxCharacters: 255,												// The maximum number of characters that can be entered
		minAlpha: 0,													// The minimum number of letters that must be entered. Note these are currently A-Z and a-z, extended Unicode is not yet supported.
		minNumeric: 0,													// The minimum number of numbers that must be entered.
		minSpecial: 0,													// The minimum number of 'special characters' the must be entered. See below for allowed characters.
		minUpperAlpha: 1,												// The minimum number of Uppercase letters (A-Z) that must be entered.
		minLowerAlpha: 1,												// The minimum number of Lowercase letters (a-z) that must be entered.
		maxConsecutive: 0,												// The maximum number of times a character may be used consecutively.
		combinationCount: 0,											// The number of character types that must be used (lower case letter, upper case letter, number, special character).
		allowSpaces: false,												// If 'true' then allow spaces in the input field; otherwise do not allow spaces.
		preventId: '',													// Specifically determines a phrase to be specifically disallowed, usually a User ID, from the input value.
		allAlphaOrAllNumeric: false,									// If 'true' the value must be all letters or all numbers (no mixing). Care should be taken so that rule collisions do not occur.
		allowedSpecialCharacters: '~!@#$%^&*()_+{}:"<>?`[];<>?\\\'',	// The set of allowed 'special characters'
		validClassName: 'valid',										// The class name to apply when a rule has been satisfied.
		invalidClassName: 'invalid',									// The class name to apply when a rule has not been satisfied.
		inputSelector: '',												// A jQuery selector for the input field being used to enter the value.
		policyIndicatorSelector: '',									// A jQuery selector for the area that displays the overall state of validation (usually to the right of the input field).
		summaryCallback: function (rulesPassed, totalRules) { },		// A callback function that can be used to update a display to show a summary of the number of rules that currently pass validation.
		rules: new Array()												// An array of rules used to validate the input value. Additional, application defined, rules can be created and executed by this script.
	};

	Fis.VisualValidator.rule = {
		visualSelector: '',															// A jQuery selector that will have the validClassName or invalidClass name applied based upon the validationRoutine return value.
		validationRoutine: function (secretText, visualSelector, localConfig) { }	// A function that will validate the input value, returning 'true' or 'false' appropriately.
	};

	// Call to initialize the control once the page has finished loading. If multiple
	// input controls are required to be validated on the same page the recommendation
	// is to call this routine when the input control receives focus.
	Fis.VisualValidator.initializeSecretCodeVisuals = function (config) {
		var local_config = $.extend({}, Fis.VisualValidator.secretCodeConfig, config);
		var input_element = $(local_config.inputSelector);

		// If we have already initialized this control, do nothing
		if (typeof input_element.data('localConfig') !== 'undefined')
			return;

		// Perform the validation on every keyup event
		input_element.data('localConfig', local_config).bind('focusin input propertychange', function () {
			var secret_code = $(this).val();
			var inner_config = $(this).data('localConfig');
			var passed_rule_count = 0;

			for (var i = 0; i < inner_config.rules.length; i++) {
				var rule = inner_config.rules[i];

				if ($.isFunction(rule.validationRoutine)) {
					var rule_passed = rule.validationRoutine(secret_code, rule.visualSelector, inner_config);
					var rule_passed_and_we_have_data = rule_passed && secret_code.length > 0;

					if (rule_passed_and_we_have_data === true)
						passed_rule_count++;

					Fis.VisualValidator.showVisuals(rule.visualSelector, rule_passed_and_we_have_data, inner_config);
				}
			}

			// After all the rules have been executed, attempt to call any page defined callback routine to update the summary information
			if ($.isFunction(inner_config.summaryCallback))
				inner_config.summaryCallback(passed_rule_count, inner_config.rules.length);
		});
	};

	// Routine to apply the appropriate style to the rule's visual indicator
	Fis.VisualValidator.showVisuals = function (visualSelector, valid, localConfig) {
		if (valid)
			$(visualSelector).removeClass(localConfig.invalidClassName).addClass(localConfig.validClassName);
		else
			$(visualSelector).removeClass(localConfig.validClassName).addClass(localConfig.invalidClassName);
	}


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Fis.VisualValidator.isUpper = function (c) {
		return c >= 'A' && c <= 'Z';
	}

	Fis.VisualValidator.getUpperCount = function (secretCode) {
		var count = 0;

		for (var i = 0; i < secretCode.length; i++) {
			if (Fis.VisualValidator.isUpper(secretCode[i]))
				count++;
		}

		return count;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Fis.VisualValidator.isLower = function (c) {
		return c >= 'a' && c <= 'z';
	}

	Fis.VisualValidator.getLowerCount = function (secretCode) {
		var count = 0;

		for (var i = 0; i < secretCode.length; i++) {
			if (Fis.VisualValidator.isLower(secretCode[i]))
				count++;
		}

		return count;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Fis.VisualValidator.isAllowedSpecial = function (c, localConfig) {
		return localConfig.allowedSpecialCharacters.indexOf(c) > -1;
	}

	Fis.VisualValidator.getSpecialCount = function (secretCode, localConfig) {
		var count = 0;

		for (var i = 0; i < secretCode.length; i++) {
			if (Fis.VisualValidator.isAllowedSpecial(secretCode[i], localConfig))
				count++;
		}

		return count;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Fis.VisualValidator.isNumeric = function (c) {
		return c >= '0' && c <= '9';
	}

	Fis.VisualValidator.getNumericCount = function (secretCode) {
		var count = 0;

		for (var i = 0; i < secretCode.length; i++) {
			if (Fis.VisualValidator.isNumeric(secretCode[i]))
				count++;
		}

		return count;
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B1 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkPolicyLength = function (secretCode, visualSelector, localConfig) {
		return secretCode.length >= localConfig.minCharacters && secretCode.length <= localConfig.maxCharacters;
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B2 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkCombinationCount = function (secretCode, visualSelector, localConfig) {
		var combination_count = 0;

		if (Fis.VisualValidator.getUpperCount(secretCode) > 0)
			combination_count++;

		if (Fis.VisualValidator.getLowerCount(secretCode) > 0)
			combination_count++;

		if (Fis.VisualValidator.getNumericCount(secretCode) > 0)
			combination_count++;

		if (Fis.VisualValidator.getSpecialCount(secretCode, localConfig) > 0)
			combination_count++;

		return combination_count >= localConfig.combinationCount;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B2 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkAlphaOnly = function (secretCode, visualSelector, localConfig) {
		if (secretCode.length === 0)
			return false;

		var alpha_count = Fis.VisualValidator.getUpperCount(secretCode) + Fis.VisualValidator.getLowerCount(secretCode);

		return alpha_count === secretCode.length;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B2 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkNumericOnly = function (secretCode, visualSelector, localConfig) {
		if (secretCode.length === 0)
			return false;

		return Fis.VisualValidator.getNumericCount(secretCode) === secretCode.length;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B2 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkOnlyAlphaOrNumeric = function (secretCode, visualSelector, localConfig) {
		if (secretCode.length === 0)
			return false;

		var alpha_count = Fis.VisualValidator.getUpperCount(secretCode) + Fis.VisualValidator.getLowerCount(secretCode);

		if (alpha_count === secretCode.length)
			return true;

		return Fis.VisualValidator.getNumericCount(secretCode) === secretCode.length;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B2 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkAlphaAndNumeric = function (secretCode, visualSelector, localConfig) {
		var alpha_count = Fis.VisualValidator.getUpperCount(secretCode) + Fis.VisualValidator.getLowerCount(secretCode);

		return (alpha_count > 0) && (Fis.VisualValidator.getNumericCount(secretCode) > 0);
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B3 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkAllowSpaces = function (secretCode, visualSelector, localConfig) {
		return !(localConfig.allowSpaces === false && secretCode.indexOf(' ') >= 0);
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B4 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkConsecutiveCharacters = function (secretCode, visualSelector, localConfig) {
		if ((secretCode.length < 1) || (localConfig.maxConsecutive < 1))
			return true;

		var previous_char = secretCode[0];
		var consecutive_char_count = 1;

		for (var i = 1; i < secretCode.length; i++) {
			if (secretCode[i] === previous_char) {
				if (++consecutive_char_count > localConfig.maxConsecutive)
					return false;
			}
			else {
				consecutive_char_count = 1;
				previous_char = secretCode[i];
			}
		}

		return true;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B6 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkAllowedSpecial = function (secretCode, visualSelector, localConfig) {
		// Spaces are not considered special characters as they are handled with the 'AllowSpaces' property
		for (var i = 0; i < secretCode.length; i++) {
			if (secretCode[i] === ' ')
				continue;

			if (Fis.VisualValidator.isNumeric(secretCode[i]) || Fis.VisualValidator.isUpper(secretCode[i]) || Fis.VisualValidator.isLower(secretCode[i]))
				continue;

			if (!Fis.VisualValidator.isAllowedSpecial(secretCode[i], localConfig))
				return false;
		}

		return true;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// B6 - Built-in rule validators for the known policy items
	Fis.VisualValidator.checkMinSpecial = function (secretCode, visualSelector, localConfig) {
		return Fis.VisualValidator.getSpecialCount(secretCode, localConfig) >= localConfig.minSpecial;
	};


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Built-in rule validators for the known policy items
	Fis.VisualValidator.checkPreventUserId = function (secretCode, visualSelector, localConfig) {
		return (localConfig.preventId.length > 0 && secretCode.indexOf(localConfig.preventId) === -1);
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Built-in rule validators for the known policy items
	Fis.VisualValidator.checkMinAlpha = function (secretCode, visualSelector, localConfig) {
		var alpha_count = Fis.VisualValidator.getUpperCount(secretCode) + Fis.VisualValidator.getLowerCount(secretCode);

		return alpha_count >= localConfig.minAlpha;
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Built-in rule validators for the known policy items
	Fis.VisualValidator.checkMinNumeric = function (secretCode, visualSelector, localConfig) {
		return Fis.VisualValidator.getNumericCount(secretCode) >= localConfig.minNumeric;
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Built-in rule validators for the known policy items
	Fis.VisualValidator.checkMinLower = function (secretCode, visualSelector, localConfig) {
		return Fis.VisualValidator.getLowerCount(secretCode) >= localConfig.minLowerAlpha;
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Built-in rule validators for the known policy items
	Fis.VisualValidator.checkMinUpper = function (secretCode, visualSelector, localConfig) {
		return Fis.VisualValidator.getUpperCount(secretCode) >= localConfig.minUpperAlpha;
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Built-in rule - Returns true when the secretCode is not empty
	Fis.VisualValidator.InformationalOnly = function (secretCode, visualSelector, localConfig) {
		return secretCode.length > 0;
	};
})(jQuery);

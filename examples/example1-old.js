if (!_object) return;

const fields = _metadata.fields;

handleOtherTaxes();
handleInstallments();
handlePropertyLogic();
handlePaymentReasons();
handleTaxDocuments();
handleFines();

function handleOtherTaxes() {

    if (_object.taxType === "otherTaxes") {

        fields.otherTaxes.hidden = false;
        fields.otherTaxes.required = true;
        fields.optionalAttachment.hidden = false;
    }
}

function handleInstallments() {

    if (_object.taxType === "installment") {

        fields.myInstallmentPlanWas.hidden = false;
        fields.myInstallmentPlanWas.required = true;
        fields.debtNature.hidden = false;
        fields.debtNature.required = true;

        if (_object.myInstallmentPlanWas === "property") {

            fields.propertyType.breakLine = true;
            fields.propertyType.size = "md";
            fields.realEstateRegistry.size = "md";
        }
    }
}

function handlePropertyLogic() {

    const isPropertyTax = ["iptu", "itbi"].includes(_object.taxType);
    const isPropertyInstallment = _object.myInstallmentPlanWas === "property";

    if (isPropertyTax || isPropertyInstallment) {

        fields.propertyType.hidden = false;
        fields.propertyType.required = true;

        if (_object.propertyType === "urban") {

            fields.realEstateRegistry.hidden = false;
            fields.realEstateRegistry.required = true;
        }

        else if (_object.propertyType === "rural") {

            fields.registrationNumber.hidden = false;
            fields.registrationNumber.required = true;
        }

        // Regras de somente leitura
        if (isPropertyInstallment || _object.taxType === "iptu")
            fields.propertyType.readOnly = true;

    }

    if (isPropertyTax && _object.propertyType)
        fields.propertyTitleAttachment.hidden = false;

}

function handlePaymentReasons() {

    if (_object.requestReason === "duplicatedPayment") {
        fields.secondPaymentReceipt.hidden = false;
        fields.secondPaymentReceipt.required = true;
        fields.accountBankData.required = true;
        fields.accountBankData.hidden = false;
    }
}

function handleTaxDocuments() {

    if (["iss", "movableTaxes"].includes(_object.taxType)) {
        fields.documentNature.hidden = false;
        fields.documentNature.required = true;

        if (_object.documentNature === "cpf") {

            fields.cpf.hidden = false;
            fields.cpf.required = true;
        }

        else if (_object.documentNature === "cnpj") {

            fields.cnpj.hidden = false;
            fields.cnpj.required = true;
        }
    }
}

function handleFines() {

    if (_object.taxType === "fines") {
        fields.fineAttachment.hidden = false;
        fields.fineIdentificationNumber.hidden = false;
    }
}
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import CustomFormField from "./CustomFormField";
import SubmitButton from "./SubmitButton";
import { useState } from "react";
import { PatientFormValidation, UserFormValidation } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { createUser, getUser, registerPatient } from "@/lib/actions/patient.actions";
import { FormFieldTypes } from "./PatientForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Doctors, GenderOptions, IdentificationTypes,PatientFormDefaultValues } from "@/constants";
import { Label } from "../ui/label";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import { FileUploader } from "../FileUploader";
import { BUCKET_ID } from "@/lib/appwrite.config";

const RegisterForm = (user:User) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ... PatientFormDefaultValues,
      name: "",
      email: "",
      phone: "",
      
    },
  });
  

  async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
    setIsLoading(true);
    try {
      let formData 
      if(values.identificationDocument && values.identificationDocument) {
        const  blobFile = new Blob([values.identificationDocument[0]],{
          type:values.identificationDocument[0].type
        })
        formData = new FormData()
        formData.append('blogFile',blobFile)
        formData.append("fileName",values.identificationDocument[0].name)
      }
      try {
        const  patientData = {
          ...values,
          userId : user.user.$id,
          birthDate: new Date(values.birthDate),
          identificationDocument : formData
        }
        // @ts-ignore
        const  patient = await registerPatient(patientData)
        if(patient) router.push(`/patients/${user.$id}/new-appointment`)
      } catch (error) {
        
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false)
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 flex-1"
      >
        <section className="space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">Let us know more about yourself</p>
        </section>
        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Personal Information</h2>
          </div>
        </section>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldTypes.INPUT}
          name="name"
          label="Full Name"
          placeholder="Nader Elhaj"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.INPUT}
            name="email"
            label="Email"
            placeholder="Email"
            iconSrc="/assets/icons/email.svg"
            iconAlt="Email"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.PHONE_INPUT}
            name="phone"
            label="Phone Number"
            placeholder="+21652241103"
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.DATE_PICKER}
            name="birthDate"
            label="Date of Birth"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.SKELETON}
            name="gender"
            label="Gender"
            renderSkeleton={(filed) => (
              <FormControl>
                <RadioGroup
                  className="flex h-11 gap-6 xl:justify-between"
                  onValueChange={filed.onChange}
                  defaultValue={filed.value}
                >
                  {GenderOptions.map((option) => (
                    <div key={option} className="radio-group">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer">
                        {option}
                      </Label>
                      
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.INPUT}
            name="address"
            label="Address"
            placeholder="14th street"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.INPUT}
            name="occupation"
            label="Occupation"
            placeholder="Software engineer"
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.INPUT}
            name="emergencyContactName"
            label="Emergency Contact Name"
            placeholder="Nader Elhaj"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.PHONE_INPUT}
            name="emergencyContactNumber"
            label="Emergency Contact Number"
            placeholder="52241103"
          />
        </div>
        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Medical Information</h2>
          </div>
        </section>
        <CustomFormField
          fieldType={FormFieldTypes.SELECT}
          control={form.control}
          name="primaryPhisician"
          label="Primary care physician"
          placeholder="Select a physician"
        >
          <>
            {Doctors.map((doctor, i) => (
              <SelectItem key={doctor.name + i} value={doctor.name}>
                <div className="flex cursor-pointer items-center gap-2">
                  <Image
                    src={doctor.image}
                    width={32}
                    height={32}
                    alt="doctor"
                    className="rounded-full border border-dark-500"
                  />
                  <p>{doctor.name}</p>
                </div>
              </SelectItem>
            ))}
          </>
        </CustomFormField>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.INPUT}
            name="insuranceProvider"
            label="Insurance Provider"
            placeholder="Nader Elhaj"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.PHONE_INPUT}
            name="insurancePolicyNumber"
            label="Insurance Policy Number"
            placeholder="52241103"
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.TEXTAREA}
            name="alergies"
            label="Alergies"
            placeholder="Peanuts,Lactose"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.TEXTAREA}
            name="currentMedication"
            label="Current Medication"
            placeholder="morphine 200g"
          />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.TEXTAREA}
            name="familyMedicalHistory"
            label="Family Madical History"
            placeholder="Granmother has heart condition"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.TEXTAREA}
            name="pastMedicalHistory"
            label="Past Medical History"
            placeholder="I had a heart attack"
          />
        </div>
        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Identification & Verification</h2>
          </div>
        </section>
        <CustomFormField
          fieldType={FormFieldTypes.SELECT}
          control={form.control}
          name="identificationType"
          label="Identification Type"
          placeholder="Select identificationt type"
        >
          <>
            {IdentificationTypes.map((type, i) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </>
        </CustomFormField>
        <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.INPUT}
            name="identificationNumber"
            label="Identification Number"
            placeholder="14348596"
          />
                <CustomFormField
            control={form.control}
            fieldType={FormFieldTypes.SKELETON}
            name="identificationDocument"
            label="Scanned Identification Document"
            renderSkeleton={(filed) => (
              <FormControl>
                <FileUploader files={filed.value} onChange={filed.onChange}/>
              </FormControl>
            )}
          />
            <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Consent&Privacy</h2>
          </div>
        </section>
        <CustomFormField
          fieldType={FormFieldTypes.CHECKBOX}
          control={form.control}
          name="treatmentConsent"
          label="I consent to treatment"
        />
        <CustomFormField
          fieldType={FormFieldTypes.CHECKBOX}
          control={form.control}
          name="disclosureConsent"
          label="I consent to disclosure of information"
        />
        <CustomFormField
          fieldType={FormFieldTypes.CHECKBOX}
          control={form.control}
          name="privacyConsent"
          label="I consent to privacy policy"
        />

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;

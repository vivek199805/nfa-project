import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getRequestById,
  postRequest,
} from "../../common/services/requestService";

const declarationSchema = z.object({
  declarations: z.tuple([
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  ]),
});

const declarationTexts = [
  "I/We have No Objection for screening of this film for jury or any of their panels, for non-commercial public shows...",
  "I/we also assure that this No Objection for the Corporation will remain valid...",
  "NFDC reserve the right to subtitle the films in any Indian/foreign language...",
  "All award winning films Prints/DCP(Unencrypted)/Bluray submitted...",
  "I/We have gone through the National Film Awards Regulations and accept these Regulations...",
  "I/We Agree to abide by the decision of jury of National Film Awards...",
  "The decision of the juries shall be final and binding...",
  "I/We certify that the film entered is NOT a dubbed/revised/copied version of a film.",
  "I/We certify that the musical score used is original.",
  "I also certify that the film in no way violates any provisions of the Indian Copyright Act, 1957.",
  "I/We hereby declare that the information provided is true...",
  "Whether Synopsis (150 word), Director and Producer’s Profile, Photo/Logo and film Stills are sent to email.",
];

const defaultValues = {
  declarations: Array(declarationTexts.length).fill(false),
};

const DeclarationSection = ({ setActiveSection, data }) => {
  const { id } = useParams();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(declarationSchema),
  });

  const { data: formData } = useQuery({
    queryKey: ["userForm", id],
    queryFn: () => getRequestById("film/feature-entry-by", id),
    enabled: !!id, // Only run query if id exists
    // staleTime: 1000 * 60 * 5, // 5 minutes - consider this data fresh for 5 mins
    // initialData: () => queryClient.getQueryData(["userForm", id]), // optional
    refetchOnMount: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (formData) {
      const declarationKeysInOrder = [
        "declaration_one",
        "declaration_two",
        "declaration_three",
        "declaration_four",
        "declaration_five",
        "declaration_six",
        "declaration_seven",
        "declaration_eight",
        "declaration_nine",
        "declaration_ten",
        "declaration_eleven",
        "declaration_twelve",
      ];

      const declarations = declarationKeysInOrder.map((key) => formData.data[key]);
      reset({ declarations });
    }
  }, [formData, reset]);

  const onSubmit = async (data) => {
    const declarationKeysInOrder = [
      "declaration_one",
      "declaration_two",
      "declaration_three",
      "declaration_four",
      "declaration_five",
      "declaration_six",
      "declaration_seven",
      "declaration_eight",
      "declaration_nine",
      "declaration_ten",
      "declaration_eleven",
      "declaration_twelve",
    ];
    const formData = new FormData();
    declarationKeysInOrder.forEach((item, index) => {
    formData.append(item, data.declarations[index] ? "true" : "false");
    });
    formData.append("step", "11");
    formData.append("id", id);

    const response = await postRequest("film/feature-update", formData);
    if (response.statusCode == 200) {
      setActiveSection(12);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4>Declaration</h4>
      {declarationTexts.map((text, index) => (
        <div key={index} className="mb-3">
          <div className="form-check">
            <Controller
              name={`declarations.${index}`}
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  className={`form-check-input ${
                    errors.declarations?.[index] ? "is-invalid" : ""
                  }`}
                  id={`decl-${index}`}
                  checked={field.value || false} // ✅ Explicitly bind checked state
                  onChange={(e) => field.onChange(e.target.checked)} // ✅ Ensure proper update
                />
              )}
            />
            <label className="form-check-label" htmlFor={`decl-${index}`}>
              {text}
            </label>
          </div>
          {errors.declarations?.[index] && (
            <div className="text-danger">
              {errors.declarations[index]?.message}
            </div>
          )}
        </div>
      ))}

      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(10)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>
        <button type="submit" className="btn btn-primary">
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </form>
  );
};

export default DeclarationSection;

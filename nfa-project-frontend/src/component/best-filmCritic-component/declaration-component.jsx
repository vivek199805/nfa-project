import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  postRequest,
} from "../../common/services/requestService";
import { useFetchById } from "../../hooks/useFetchById";

const declarationSchema = z.object({
  declarations: z.tuple([
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
    z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  ]),
});

const declarationTexts = [
  "I/We agree to abide by the decision of jury of national award for the best writing on cinema as final and binding.",
  "I/We have gone through the National Film Awards Regulations and I/We accept these regulations.",
  "The jury shall make recommendations, which will be approved by the Ministry of Information and Broadcasting and the decision of the Ministry shall be final and binding.",
  "The decision of the juries shall be final and binding and no appeal or correspondence regarding their decision shall be made by me/us Author/Critic's profile and stills/logo of publisher are sent to email.",
];

const defaultValues = {
  declarations: Array(declarationTexts.length).fill(false),
};

const DeclarationSection = ({ setActiveSection }) => {
  const { id } = useParams();
  const { data: formData } = useFetchById("best-film-critic-entry-by", id);  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(declarationSchema),
  });

  useEffect(() => {
    if (formData) {
      const declarationKeysInOrder = [
        "declaration_one",
        "declaration_two",
        "declaration_three",
        "declaration_four",
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
    ];
    const formData = new FormData();
    declarationKeysInOrder.forEach((item, index) => {
    formData.append(item, data.declarations[index] ? "true" : "false");
    });
    formData.append("step", 4);
    formData.append("id", id);

    const response = await postRequest('update-entry', formData);
    if (response.statusCode == 200) {
      setActiveSection(5);
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
          onClick={() => setActiveSection(3)}
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

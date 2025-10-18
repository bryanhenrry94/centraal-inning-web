import { useEffect, useState } from "react";
import { Controller, useWatch, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import { calculateInterestDetail } from "@/app/actions/verdict";
import { IVerdictInterestCreate } from "@/lib/validations/verdict-interest";

interface InterestCellProps {
  control: any;
  index: number;
}

const InterestCell: React.FC<InterestCellProps> = ({ control, index }) => {
  const item = useWatch({
    control,
    name: `verdictInterest.${index}`,
  });

  const [totalInterest, setTotalInterest] = useState(0);
  const {
    setValue,
    formState: { errors },
  } = useFormContext<{
    verdictInterest: IVerdictInterestCreate[];
  }>(); // ⬅️ para acceder a setValue desde context

  useEffect(() => {
    const calculate = async () => {
      if (
        !item ||
        !item.baseAmount ||
        !item.interestType ||
        !item.calculationStart ||
        !item.calculationEnd
      )
        return;

      const details = await calculateInterestDetail(
        item.interestType,
        item.baseAmount,
        item.calculatedInterest,
        item.calculationStart,
        item.calculationEnd
      );

      const total = details?.reduce((acc, curr) => acc + curr.interest, 0) || 0;

      setValue(`verdictInterest.${index}.details`, details);
      setValue(`verdictInterest.${index}.totalInterest`, total);

      setTotalInterest(total); // para mostrar en el campo
    };

    calculate();
  }, [index, item.baseAmount, setValue]);

  return (
    <Controller
      name={`verdictInterest.${index}.totalInterest`}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={totalInterest.toFixed(2)}
          size="small"
          error={!!errors.verdictInterest?.[index]?.totalInterest}
          helperText={errors.verdictInterest?.[index]?.totalInterest?.message}
          InputProps={{
            readOnly: true,
          }}
          disabled
        />
      )}
    />
  );
};

export default InterestCell;

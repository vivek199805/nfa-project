// components/CustomDatePicker.jsx
import { Box, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import dayjs from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';

const rangeShortcuts = [
  {
    label: 'This Week',
    getValue: () => [dayjs().startOf('week'), dayjs().endOf('week')],
  },
  {
    label: 'Last 7 Days',
    getValue: () => [dayjs().subtract(7, 'day'), dayjs()],
  },
  {
    label: 'This Month',
    getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')],
  },
  {
    label: 'Reset',
    getValue: () => [null, null],
  },
];

const CustomDatePicker = ({
  type = 'single', // 'single' or 'range'
  label = '',
  value,
  onChange,
  error = false,
  helperText = '',
  fullWidth = true,
  disabled = false,
  minDate,
  maxDate,
  width = { width: "100%" }
}) => {
  const isDayjs = (val) => dayjs.isDayjs(val);

  const safeSingleValue = isDayjs(value) ? value : value ? dayjs(value) : null;
  const safeRangeValue =
    Array.isArray(value) && value.length === 2
      ? [isDayjs(value[0]) ? value[0] : value[0] ? dayjs(value[0]) : null,
      isDayjs(value[1]) ? value[1] : value[1] ? dayjs(value[1]) : null]
      : [null, null];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {type === 'range' ? (
        <>
          {/* <DateRangePicker
            value={safeRangeValue}
            onChange={onChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
              sx={width}
            enableAccessibleFieldDOMStructure={false}
            slots={{ textField: TextField }}
            slotProps={{
              shortcuts: { items: rangeShortcuts },
              textField: {
                fullWidth,
                error,
                helperText,
              },
            }}
          /> */}
          <DemoContainer components={['DateRangePicker']}>
            {/* <DemoItem label={label} component="DateRangePicker"> */}
            <DateRangePicker
              value={safeRangeValue}
              onChange={onChange}
              disabled={disabled}
              minDate={minDate}
              maxDate={maxDate}
              sx={width}
              slotProps={{
                shortcuts: {
                  items: rangeShortcuts,
                },
                actionBar: { actions: [] },
                openPickerIcon: {
                  color: 'primary',
                },
              }}
            />
            {/* </DemoItem> */}
          </DemoContainer>
        </>
      ) : (
        <>
          {/* <DatePicker
            label={label}
            value={safeSingleValue}
            onChange={onChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            sx={width}
            enableAccessibleFieldDOMStructure={false}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth,
                error,
                helperText,
              },
            }}
          /> */}

          <DemoContainer components={['DatePicker']}>
            {/* <DemoItem label={label} component="DatePicker"> */}
                <DatePicker
                  value={safeSingleValue}
                  onChange={onChange}
                  disabled={disabled}
                  minDate={minDate}
                  maxDate={maxDate}
                  sx={width}
                  slotProps={{
                    actionBar: { actions: [] },
                    openPickerIcon: {
                      color: 'primary',
                    },
                  }}
                />
            {/* </DemoItem> */}
          </DemoContainer>
        </>
      )}
    </LocalizationProvider>
  );
};

export default CustomDatePicker;

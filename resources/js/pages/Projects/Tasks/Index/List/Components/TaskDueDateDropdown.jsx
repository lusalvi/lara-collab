import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';

import useTasksStore from '@/hooks/store/useTasksStore';

export default function TaskDueDateDropdown({ task }) {
    const { updateTaskProperty } = useTasksStore();

    const parseDate = (date) => {
        if (!date) return null;

        // Si viene con hora (ISO), nos quedamos solo con la fecha
        const onlyDate = String(date).split('T')[0];
        
        // Validar que sea una fecha válida (YYYY-MM-DD)
        if (!onlyDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return null;
        }

        // Creamos la fecha al mediodía para evitar problemas de zona horaria
        const parsed = new Date(`${onlyDate}T12:00:00`);
        
        // Validar que la fecha sea válida (no NaN)
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <DateInput
                value={parseDate(task.due_on)}
                valueFormat="DD/MM/YYYY"
                clearable
                size="xs"
                radius="sm"
                variant="filled"
                placeholder="Sin fecha"
                minDate={parseDate(task.start_on) || undefined}
                onChange={(value) => {
                    updateTaskProperty(
                        task,
                        'due_on',
                        value ? dayjs(value).format('YYYY-MM-DD') : null
                    );
                }}
            />
        </div>
    );
}
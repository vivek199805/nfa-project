import BaseRepository from "./base.repository.js";

const paymentRepository = new BaseRepository("payment");

export const createPayment = (data) => paymentRepository.create(data);

export const updatePaymentById = (id, data) =>
  paymentRepository.updateById(id, data);

export const findPaymentByGatewayOrder = ({ gatewayOrderId, gateway }) =>
  paymentRepository.findFirst({
    gateway_order_id: gatewayOrderId,
    gateway,
  });

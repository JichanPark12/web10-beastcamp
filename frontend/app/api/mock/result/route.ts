export const GET = async () => {
  const selectedSeats = [
    {
      seatInfoId: "25016072:25001454:001:14821",
      seatGrade: "S",
      seatGradeName: "S석",
      floor: "",
      rowNo: "101구역 10열",
      seatNo: "8",
      salesPrice: 154000,
      posLeft: 103.294,
      posTop: 129.235,
      isExposable: true,
    },
    {
      seatInfoId: "25016072:25001454:001:14822",
      seatGrade: "S",
      seatGradeName: "S석",
      floor: "",
      rowNo: "101구역 10열",
      seatNo: "9",
      salesPrice: 154000,
      posLeft: 106.294,
      posTop: 129.235,
      isExposable: true,
    },
  ];

  return Response.json(selectedSeats, { status: 200 });
};

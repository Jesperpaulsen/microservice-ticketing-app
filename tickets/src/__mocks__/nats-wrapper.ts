export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (data: string, subject: string, callback: () => void) => {
          callback();
        },
      ),
  },
};

global.chrome = {
  tabs: {
    query: async () => { throw new Error("Unimplemented.") };
  }
};

/*
test("getActiveTabId returns active tab ID", async () => {
  jest.spyOn(chrome.tabs, "query").mockResolvedValue([{
    id: 3,
    active: true,
    currentWindow: true
  }]);
  expect(await getActiveTabId()).toBe(3);
});
*/

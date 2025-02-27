describe('Unit Tests ->', function () {
  describe('Effects', function () {
    describe('Base', function () {
      let effect

      beforeEach(function () {
        effect = new etro.effect.Visual()
      })

      it("should be of type 'effect'", function () {
        expect(effect.type).toBe('effect')
      })

      it('should set _target when attached', function () {
        const movie = mockMovie()
        effect.tryAttach(movie)
        expect(effect._target).toBe(movie)
      })

      it('should throw error when detached from movie before being attached', function () {
        expect(() => {
          const movie = mockMovie()
          effect.tryDetach(movie)
        }).toThrow(new Error('No movie to detach from'))
      })

      it('should not forget movie after being attached twice and then detached', function () {
        const movie = mockMovie()
        effect.tryAttach(movie)
        effect.tryAttach(movie)

        effect.tryDetach()

        expect(effect._target).toEqual(movie)
      })
    })

    describe('Stack', function () {
      let stack

      beforeEach(function () {
        const effects = [
          jasmine.createSpyObj('effect1', ['apply', 'attach', 'detach']),
          jasmine.createSpyObj('effect2', ['apply', 'attach', 'detach'])
        ]
        stack = new etro.effect.Stack({ effects })
        const movie = mockMovie()
        stack.tryAttach(movie)
      })

      it('should attach its children to the target when attached', function () {
        stack.effects.forEach(effect => {
          expect(effect.attach).toHaveBeenCalledWith(stack._target)
        })
      })

      it('should attach a new child', function () {
        const child = jasmine.createSpyObj('effect3', ['apply', 'attach', 'detach'])

        stack.effects.push(child)

        expect(child.attach).toHaveBeenCalled()
      })

      it('should detach each child that is removed', function () {
        const child = stack.effects[0]

        stack.effects.shift() // remove first element

        expect(child.detach).toHaveBeenCalled()
      })

      it('should detach a child that is replaced', function () {
        const child = stack.effects[0]

        stack.effects[0] = new etro.effect.Visual()

        expect(child.detach).toHaveBeenCalled()
      })

      it('children array should implement common array methods', function () {
        const dummy = () => jasmine.createSpyObj('effect', ['apply', 'attach', 'detach'])
        const calls = {
          concat: [[dummy()]],
          every: [layer => true],
          includes: [dummy()],
          pop: [],
          push: [dummy()],
          unshift: [dummy()]
        }
        for (const method in calls) {
          const args = calls[method]
          const copy = [...stack.effects]
          const expectedResult = Array.prototype[method].apply(copy, args)
          const actualResult = stack.effects[method](...args)
          expect(actualResult).toEqual(expectedResult)
          expect(stack.effects).toEqual(copy)
        }
      })

      it('should be able to attach, apply and detach after a child has been directly deleted', function () {
        // Start with one effect
        stack.effects.push(new etro.effect.Visual())

        // Delete the effect
        delete stack.effects[0]

        // Perform normal operations
        const movie = mockMovie()
        stack.attach(movie)
        stack.apply(movie)
        stack.detach()
      })
    })
  })
})

using Microsoft.AspNetCore.Mvc;
using Raven.Client.Documents;

namespace BeerRatingApp.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BeersController : ControllerBase
    {
        private readonly IDocumentStore _documentStore;

        public BeersController(IDocumentStore documentStore)
        {
            _documentStore = documentStore;
        }

        [HttpGet]
        public async Task<IEnumerable<Beer>> Get()
        {
            // return all beer documents
            using var session = _documentStore.OpenAsyncSession();
            var beers = await session.Query<Beer>().ToListAsync();

            return beers;
        }

        [HttpPost("{id}/rate")]
        public async Task<decimal?> Rate(string id, [FromBody] int rating)
        {
            if (rating is <= 0 or > 5)
                throw new InvalidOperationException("rating must be a number between 1 and 5");

            id = Uri.UnescapeDataString(id);

            using var session = _documentStore.OpenAsyncSession();

            // increment the counter corresponding to the rating
            session.CountersFor(id).Increment(rating.ToString());
            await session.SaveChangesAsync();

            // return current rating
            var currentRating = await GetRating(id);
            return currentRating;
        }

        [HttpGet("{id}/rating")]
        public async Task<decimal?> GetRating(string id)
        {
            id = Uri.UnescapeDataString(id);

            // get all counters for this beer document
            using var session = _documentStore.OpenAsyncSession();
            var ratings = await session.CountersFor(id).GetAllAsync();

            // if it has no counters, rating is 0 
            if (ratings.Count == 0)
                return 0;

            // sum the product of each score and its corresponding count, 
            // then divide by the total number of ratings
            var numberOfVotes = ratings.Values.Sum();
            long? sum = 0;
            foreach (var kvp in ratings)
            {
                if (int.TryParse(kvp.Key, out var score) == false ||
                    score is <= 0 or > 5)
                    continue;


                sum += kvp.Value * score;
            }

            var avg = (decimal)sum!/numberOfVotes;
            return avg;
        }
    }
}
